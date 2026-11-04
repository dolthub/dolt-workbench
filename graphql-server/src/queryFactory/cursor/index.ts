import { clearTimeout, setTimeout } from "timers";
import { ClassifiedResult } from "../mysql/classifyResult";
import { RawRow } from "../types";

// An open cursor holds a connection and, on some engines, locks on the tables
// it reads, so one left behind by a closed tab shouldn't outlive a short pause.
export const IDLE_TTL_MS = 60 * 1000;

// Bounds what a cursor holds of a statement that must finish before its first
// page. Past it, a cursor that can hand the query back to the normal path
// does (see writesNothing); one that can't serves the first page and then
// lets later pages re-run the query rather than keep holding the result.
export const MAX_BUFFERED_BYTES = 64 * 1024 * 1024;

function approxBytes(row: RawRow): number {
  let n = 0;
  Object.values(row).forEach(v => {
    if (typeof v === "string") n += v.length * 2;
    else if (Buffer.isBuffer(v)) n += v.byteLength;
    else n += 8;
  });
  return n;
}

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
  // `notStarted` marks an error raised before the statement began executing
  // (e.g. a parse error), which the normal path can safely run again.
  error(e: Error, notStarted?: boolean): void;
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
  // The cursor was dropped mid-statement: stop the statement and release the
  // resource. Only called once the statement can no longer be writing: before
  // the first page only when writesNothing, otherwise after it.
  abandon(): void;
  // Classifies a statement that ran to completion exactly as the
  // non-cursor path does.
  classify(sets: ResultSet[]): ClassifiedResult;
  // True when the cursor's connection can't write (a read-only session or
  // handle), so a statement it errored on, or that was stopped before its
  // first page, changed nothing and can run again on the normal path.
  readonly writesNothing: boolean;
  // True when the statement may still be writing while its rows stream, so
  // the first page must wait for it to finish to keep the normal path's
  // guarantee that a query's effects are visible once it returns.
  readonly completeBeforeFirstPage: boolean;
};

// Holds one executing statement so later pages read the next rows instead of
// re-executing the query.
export class SqlCursor {
  position = 0;

  private sets: ResultSet[] = [];

  private consumed = 0;

  private done = false;

  private error: Error | undefined;

  private target = 1;

  private wake: (() => void) | undefined;

  private lock: Promise<unknown> = Promise.resolve();

  private closed = false;

  private finishing: Promise<string[]> | undefined;

  private bufferedBytes = 0;

  private retryable = false;

  private firstPageServed = false;

  private retiring = false;

  private warningsSent = false;

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
      error: (e, notStarted) => {
        this.error = e;
        this.retryable = this.source.writesNothing || !!notStarted;
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
    const next = this.lock.then(async () => {
      try {
        return await this.readPage(offset, pageSize);
      } finally {
        if (offset === 0) this.firstPageServed = true;
        if (this.retiring) this.close();
      }
    });
    this.lock = next.catch(() => undefined);
    return next;
  }

  // Stops holding the statement for later pages. A first page still in
  // flight on a connection that can write is let finish, since the
  // statement may already have written and must not be re-run.
  retire() {
    if (!this.firstPageServed && !this.source.writesNothing) {
      this.retiring = true;
      return;
    }
    this.close();
  }

  private close() {
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
    if (this.position === 0) {
      this.bufferedBytes += approxBytes(r);
      if (
        this.source.writesNothing &&
        this.bufferedBytes > MAX_BUFFERED_BYTES
      ) {
        this.close();
        return;
      }
    }
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
      const retry = this.position === 0 && this.retryable;
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
    if (this.position === 0 && this.bufferedBytes > MAX_BUFFERED_BYTES) {
      this.close();
    }
    const served = Math.min(rows.length, pageSize);
    this.consumed += served;
    this.position += served;
    this.compact();
    return {
      rows,
      isMutation: false,
      executionMessage: "",
      warnings: this.done ? await this.getWarnings() : [],
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

  // Drops served rows, so a cursor never holds more than the next page.
  private compact() {
    this.firstRows().splice(0, this.consumed);
    this.consumed = 0;
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

  // Each execution's warnings go out once, with the first page served after
  // the statement finishes.
  private async getWarnings(): Promise<string[]> {
    if (this.warningsSent) return [];
    this.warningsSent = true;
    return (await this.finishing) ?? [];
  }
}

// Holds at most one open cursor. Starting a new query closes it first: the
// new statement may be DDL that would otherwise wait on the open cursor's
// table locks, and telling the two apart would mean parsing SQL.
export class SqlCursorStore {
  private current: { key: string; cursor: SqlCursor } | undefined;

  private idleTimer: ReturnType<typeof setTimeout> | undefined;

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
    if (offset !== 0) {
      if (this.current?.key !== key) return undefined;
      return this.track(this.current.cursor.page(offset, pageSize));
    }
    this.closeAll();
    const source = await createSource();
    if (!source) return undefined;
    const cursor = new SqlCursor(source);
    this.closeAll();
    this.current = { key, cursor };
    return this.track(cursor.page(0, pageSize));
  }

  closeAll() {
    this.clearIdleTimer();
    this.current?.cursor.retire();
    this.current = undefined;
  }

  private async track(
    page: Promise<CursorPage | undefined>,
  ): Promise<CursorPage | undefined> {
    this.clearIdleTimer();
    try {
      return await page;
    } finally {
      this.armIdleTimer();
    }
  }

  private clearIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
  }

  private armIdleTimer() {
    this.clearIdleTimer();
    const open = this.current;
    if (!open) return;
    this.idleTimer = setTimeout(() => {
      if (this.current === open) this.closeAll();
    }, IDLE_TTL_MS);
    this.idleTimer.unref();
  }
}
