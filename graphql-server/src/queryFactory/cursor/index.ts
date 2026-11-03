import { ClassifiedResult } from "../mysql/classifyResult";
import { RawRow, SqlSelectResult } from "../types";

const MAX_OPEN_CURSORS = 2;
const IDLE_TTL_MS = 5 * 60 * 1000;

export type CursorPage = ClassifiedResult & {
  // Includes one lookahead row past pageSize when more rows exist, matching
  // the ROW_LIMIT + 1 convention used by getNextOffset.
  rows: RawRow[];
  warnings: string[];
};

// One result in protocol order: rows from a row-producing statement, or the
// driver's status for one that produced none (OK packet, command complete).
export type ResultSet = { rows: RawRow[] } | { status: unknown };

// How a driver adapter reports a statement's progress to the cursor.
export type CursorSink = {
  rowSet(): void;
  status(meta: unknown): void;
  row(r: RawRow): void;
  error(e: Error): void;
  end(): void;
};

// A statement executing on a resource dedicated to one cursor (a pooled
// connection or a separate SQLite handle), with flow control over its rows.
export type CursorSource = {
  start(sink: CursorSink): void;
  pause(): void;
  resume(): void;
  // The statement completed: release the resource and return its warnings.
  finish(): Promise<string[]>;
  // The cursor was dropped mid-statement: stop or drain the statement and
  // release the resource. Rows delivered afterwards are ignored.
  abandon(): void;
  // Classifies a statement that ran to completion exactly as the
  // non-cursor path does.
  classify(sets: ResultSet[]): ClassifiedResult;
  // True when the cursor ran the statement under restrictions the normal
  // path doesn't have (read-only, single statement), so an error before the
  // first page means "run it the normal way" rather than a user error.
  readonly retryOnEarlyError: boolean;
  // True when the statement may still be writing while its rows stream, so
  // the first page must wait for it to finish to keep the normal path's
  // guarantee that a query's effects are visible once it returns.
  readonly completeBeforeFirstPage: boolean;
};

// Holds one executing statement so later pages read the next rows instead of
// re-executing the query.
export class SqlCursor {
  position = 0;

  lastUsed = Date.now();

  private sets: ResultSet[] = [];

  private consumed = 0;

  private done = false;

  private error: Error | undefined;

  private target = 1;

  private wake: (() => void) | undefined;

  private lock: Promise<unknown> = Promise.resolve();

  private closed = false;

  private finishing: Promise<string[]> | undefined;

  constructor(private readonly source: CursorSource) {
    source.start({
      rowSet: () => {
        this.sets.push({ rows: [] });
        this.notify();
      },
      status: meta => {
        this.sets.push({ status: meta });
        this.notify();
      },
      row: r => this.onRow(r),
      error: e => {
        this.error = e;
        this.complete();
      },
      end: () => this.complete(),
    });
  }

  // Serialized so concurrent requests for one cursor can't interleave reads.
  async page(
    offset: number,
    pageSize: number,
  ): Promise<CursorPage | undefined> {
    const next = this.lock.then(async () => this.readPage(offset, pageSize));
    this.lock = next.catch(() => undefined);
    return next;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.notify();
    if (!this.done) this.source.abandon();
  }

  private onRow(r: RawRow) {
    if (this.closed) return;
    const last = this.sets[this.sets.length - 1] as ResultSet | undefined;
    if (!last || !("rows" in last)) return;
    last.rows.push(r);
    if (this.sets.length === 1 && this.buffered() >= this.target) {
      this.source.pause();
      this.notify();
    }
  }

  private complete() {
    if (this.done) return;
    this.done = true;
    if (!this.closed) this.finishing = this.source.finish();
    this.notify();
  }

  private async readPage(
    offset: number,
    pageSize: number,
  ): Promise<CursorPage | undefined> {
    if (this.closed || offset !== this.position) return undefined;
    this.lastUsed = Date.now();

    await this.waitFor(
      pageSize + 1,
      () => this.buffered() > pageSize || !this.isSingleRowSet(),
    );
    if (
      !this.isSingleRowSet() ||
      (this.position === 0 && this.source.completeBeforeFirstPage)
    ) {
      await this.waitFor(Infinity, () => false);
    }
    if (this.isClosed()) return undefined;

    if (this.error) {
      const retry = this.position === 0 && this.source.retryOnEarlyError;
      this.close();
      await this.finishing;
      if (retry) return undefined;
      throw this.error;
    }

    if (this.done && this.position === 0) {
      const classified = this.source.classify(this.sets);
      if (classified.isMutation || !this.isSingleRowSet()) {
        this.close();
        return {
          ...classified,
          rows: classified.rows.slice(0, pageSize + 1),
          warnings: await this.getWarnings(),
        };
      }
    }

    const rows = this.firstRows().slice(
      this.consumed,
      this.consumed + pageSize + 1,
    );
    const served = Math.min(rows.length, pageSize);
    this.consumed += served;
    this.position += served;
    this.compact();
    const hasMore = rows.length > pageSize;
    return {
      rows,
      isMutation: false,
      executionMessage: "",
      warnings: !hasMore && this.done ? await this.getWarnings() : [],
    };
  }

  private firstRows(): RawRow[] {
    const s = this.sets[0] as ResultSet | undefined;
    return s && "rows" in s ? s.rows : [];
  }

  private buffered(): number {
    return this.firstRows().length - this.consumed;
  }

  private isSingleRowSet(): boolean {
    return (
      this.sets.length === 0 ||
      (this.sets.length === 1 && "rows" in this.sets[0])
    );
  }

  // Drops already-served rows so a long scroll doesn't retain them.
  private compact() {
    if (this.consumed > 1000) {
      this.firstRows().splice(0, this.consumed);
      this.consumed = 0;
    }
  }

  private async waitFor(target: number, ready: () => boolean): Promise<void> {
    this.target = target;
    while (!this.done && !this.closed && !ready()) {
      const woken = new Promise<void>(resolve => {
        this.wake = resolve;
      });
      // resume() can synchronously deliver rows and call notify(), so the
      // waiter must exist first.
      this.source.resume();
      // eslint-disable-next-line no-await-in-loop
      await woken;
    }
  }

  private isClosed(): boolean {
    return this.closed;
  }

  private notify() {
    const w = this.wake;
    this.wake = undefined;
    w?.();
  }

  private async getWarnings(): Promise<string[]> {
    return (await this.finishing) ?? [];
  }
}

export class SqlCursorStore {
  private cursors = new Map<string, SqlCursor>();

  static key(args: {
    databaseName: string;
    refName?: string;
    schemaName?: string;
    queryString: string;
  }): string {
    return [
      args.databaseName,
      args.refName ?? "",
      args.schemaName ?? "",
      args.queryString,
    ].join("\0");
  }

  // Offset 0 always starts a fresh execution. Any other offset continues the
  // open cursor for this query if it's positioned there; otherwise returns
  // undefined so the caller re-executes.
  async page(
    key: string,
    offset: number,
    pageSize: number,
    createSource: () => Promise<CursorSource | undefined>,
  ): Promise<CursorPage | undefined> {
    if (offset !== 0) return this.cursors.get(key)?.page(offset, pageSize);

    this.cursors.get(key)?.close();
    this.cursors.delete(key);
    this.evict();
    const source = await createSource();
    if (!source) return undefined;
    const cursor = new SqlCursor(source);
    this.cursors.set(key, cursor);
    return cursor.page(0, pageSize);
  }

  closeAll() {
    this.cursors.forEach(c => c.close());
    this.cursors.clear();
  }

  private evict() {
    const now = Date.now();
    [...this.cursors.entries()].forEach(([k, c]) => {
      if (now - c.lastUsed > IDLE_TTL_MS) {
        c.close();
        this.cursors.delete(k);
      }
    });
    while (this.cursors.size >= MAX_OPEN_CURSORS) {
      const [oldestKey, oldest] = [...this.cursors.entries()].sort(
        ([, a], [, b]) => a.lastUsed - b.lastUsed,
      )[0];
      oldest.close();
      this.cursors.delete(oldestKey);
    }
  }
}

// Runs the statement through the factory's normal path and pages the complete
// result from memory: later pages stop re-executing the query, and results
// and errors are exactly the normal path's. For drivers that can't stream rows
// lazily, such as DoltLite, whose iterate() materializes every row up front.
export function materializedSource(
  run: () => Promise<SqlSelectResult>,
): CursorSource {
  let result: SqlSelectResult | undefined;
  return {
    retryOnEarlyError: false,
    completeBeforeFirstPage: true,
    start(sink) {
      run().then(
        res => {
          result = res;
          if (res.isMutation) {
            sink.status(res);
          } else {
            sink.rowSet();
            res.rows.forEach(r => sink.row(r));
          }
          sink.end();
        },
        (e: Error) => sink.error(e),
      );
    },
    pause() {},
    resume() {},
    async finish() {
      return result?.warnings ?? [];
    },
    abandon() {},
    classify() {
      return {
        rows: result?.rows ?? [],
        isMutation: result?.isMutation ?? false,
        executionMessage: result?.executionMessage ?? "",
      };
    },
  };
}
