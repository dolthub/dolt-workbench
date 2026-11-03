import type { FieldPacket, PoolConnection, ResultSetHeader } from "mysql2";
import { clearTimeout, setTimeout } from "timers";
import { CursorSink, CursorSource, ResultSet } from "../cursor";
import { RawRow } from "../types";
import { ClassifiedResult, classifyMysqlResult } from "./classifyResult";

// MySQL streams a CALL's result sets while the procedure runs, so pausing a
// reader holds back writes queued after the current result set, and killing
// it skips them. MySQL statements therefore finish before their first page
// (later pages are served from memory), and one abandoned before that is
// drained; the budget bounds how long a runaway read holds a connection.
const DRAIN_BUDGET_MS = 30_000;
const DESTROY_AFTER_KILL_MS = 5_000;

type QueryEvents = {
  on(event: "fields", cb: (f: FieldPacket[] | undefined) => void): QueryEvents;
  on(event: "result", cb: (r: RawRow | ResultSetHeader) => void): QueryEvents;
  on(event: "error", cb: (e: Error) => void): QueryEvents;
  on(event: "end", cb: () => void): QueryEvents;
};

async function run(
  conn: PoolConnection,
  sql: string,
  params?: unknown,
): Promise<any> {
  return new Promise((resolve, reject) => {
    conn.query(sql, params as any, (err, res) =>
      err ? reject(err) : resolve(res),
    );
  });
}

export type MysqlCursorOptions = {
  setup: string[];
  // Dolt finishes a statement's writes (procedures, RETURNING) before it
  // streams rows, so its reads can pause between pages and an abandoned
  // statement can be killed right away.
  writesCompleteBeforeRows: boolean;
};

export async function createMysqlCursorSource(
  getConn: () => Promise<PoolConnection>,
  sql: string,
  params: unknown,
  opts: MysqlCursorOptions,
): Promise<CursorSource> {
  const conn = await getConn();
  try {
    for (const s of opts.setup) {
      // eslint-disable-next-line no-await-in-loop
      await run(conn, s);
    }
  } catch (e) {
    conn.release();
    throw e;
  }
  return new MysqlCursorSource(
    conn,
    getConn,
    sql,
    params,
    opts.writesCompleteBeforeRows,
  );
}

class MysqlCursorSource implements CursorSource {
  readonly retryOnEarlyError = false;

  readonly completeBeforeFirstPage: boolean;

  private ended = false;

  private abandoned = false;

  private released = false;

  private timers: Array<ReturnType<typeof setTimeout>> = [];

  constructor(
    private readonly conn: PoolConnection,
    private readonly getConn: () => Promise<PoolConnection>,
    private readonly sql: string,
    private readonly params: unknown,
    private readonly writesCompleteBeforeRows: boolean,
  ) {
    this.completeBeforeFirstPage = !writesCompleteBeforeRows;
  }

  start(sink: CursorSink) {
    let expectStatus = false;
    const q = this.conn.query(
      this.sql,
      this.params as any,
    ) as unknown as QueryEvents;
    q.on("fields", f => {
      // OK packets also emit `fields` (undefined) before their `result`.
      expectStatus = !f;
      if (f) sink.rowSet();
    })
      .on("result", r => {
        if (expectStatus) {
          expectStatus = false;
          sink.status(r);
        } else {
          sink.row(r as RawRow);
        }
      })
      .on("error", e => {
        this.onEnded();
        sink.error(e);
      })
      .on("end", () => {
        this.onEnded();
        sink.end();
      });
  }

  pause() {
    this.conn.pause();
  }

  resume() {
    this.conn.resume();
  }

  async finish(): Promise<string[]> {
    try {
      this.conn.resume();
      const res: RawRow[] = await run(this.conn, "SHOW WARNINGS");
      return res.map(w => w.Message);
    } catch {
      return [];
    } finally {
      this.release();
    }
  }

  abandon() {
    this.abandoned = true;
    this.conn.resume();
    const budget = setTimeout(
      () => {
        if (this.ended) return;
        void this.killQuery();
        const destroy = setTimeout(() => {
          if (this.released) return;
          this.released = true;
          this.conn.destroy();
        }, DESTROY_AFTER_KILL_MS);
        destroy.unref();
        this.timers.push(destroy);
      },
      this.writesCompleteBeforeRows ? 0 : DRAIN_BUDGET_MS,
    );
    budget.unref();
    this.timers.push(budget);
  }

  classify(sets: ResultSet[]): ClassifiedResult {
    const raws = sets.map(s => ("rows" in s ? s.rows : s.status));
    const raw = raws.length === 1 ? raws[0] : raws;
    const affected =
      raw &&
      !Array.isArray(raw) &&
      typeof raw === "object" &&
      "affectedRows" in raw
        ? (raw as ResultSetHeader).affectedRows
        : undefined;
    const records = Array.isArray(raw) ? (raw as RawRow[]) : [];
    return classifyMysqlResult({ raw: raw as any, records, affected });
  }

  private onEnded() {
    this.ended = true;
    if (!this.abandoned) return;
    this.timers.forEach(t => clearTimeout(t));
    this.release();
  }

  private release() {
    if (this.released) return;
    this.released = true;
    this.conn.release();
  }

  private async killQuery(): Promise<void> {
    const { threadId } = this.conn;
    if (!threadId) return;
    try {
      const killer = await this.getConn();
      try {
        await run(killer, "KILL QUERY ?", [threadId]);
      } finally {
        killer.release();
      }
    } catch {
      // Best effort: the statement may have already finished.
    }
  }
}
