import type { FieldPacket, PoolConnection, ResultSetHeader } from "mysql2";
import { CursorSink, CursorSource, ResultSet } from "../cursor";
import { RawRow } from "../types";
import { ClassifiedResult, classifyMysqlResult } from "./classifyResult";

const READ_ONLY = "SET SESSION TRANSACTION READ ONLY";
const READ_WRITE = "SET SESSION TRANSACTION READ WRITE";

type QueryEvents = {
  on(event: "fields", cb: (f: FieldPacket[] | undefined) => void): QueryEvents;
  on(event: "result", cb: (r: RawRow | ResultSetHeader) => void): QueryEvents;
  on(event: "error", cb: (e: Error) => void): QueryEvents;
  on(event: "end", cb: () => void): QueryEvents;
};

async function run(
  conn: PoolConnection,
  sql: string,
  params?: unknown[],
): Promise<any> {
  const [res] = await conn.promise().query(sql, params);
  return res;
}

export type MysqlCursorOptions = {
  setup: string[];
  // MySQL streams a CALL's result sets while the procedure runs, and Dolt
  // commits an INSERT ... RETURNING only after its last row, so a statement
  // stopped mid-stream may lose writes. Statements therefore finish before
  // their first page. MySQL runs them in a read-only session that rejects
  // writes before they start, so a write re-runs on the normal path, and a
  // statement stopped for buffering too much has changed nothing. Dolt
  // ignores read-only sessions, so it can't.
  readOnly: boolean;
};

export async function createMysqlCursorSource(
  getConn: () => Promise<PoolConnection>,
  sql: string,
  params: unknown[],
  opts: MysqlCursorOptions,
): Promise<CursorSource> {
  const conn = await getConn();
  const { readOnly } = opts;
  try {
    for (const s of readOnly ? [...opts.setup, READ_ONLY] : opts.setup) {
      // eslint-disable-next-line no-await-in-loop
      await run(conn, s);
    }
  } catch (e) {
    conn.destroy();
    throw e;
  }
  return new MysqlCursorSource(conn, getConn, sql, params, readOnly);
}

class MysqlCursorSource implements CursorSource {
  readonly writesNothing: boolean;

  readonly completeBeforeFirstPage = true;

  private ended = false;

  private released = false;

  constructor(
    private readonly conn: PoolConnection,
    private readonly getConn: () => Promise<PoolConnection>,
    private readonly sql: string,
    private readonly params: unknown,
    private readonly readOnly: boolean,
  ) {
    this.writesNothing = readOnly;
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
    let warnings: string[] = [];
    try {
      this.conn.resume();
      const res: RawRow[] = await run(this.conn, "SHOW WARNINGS");
      warnings = res.map(w => w.Message);
    } catch {
      // Warnings are best effort.
    }
    await this.release();
    return warnings;
  }

  // The connection is destroyed rather than pooled, so a KILL that arrives
  // late can't interrupt whoever uses it next.
  abandon() {
    if (this.released) return;
    this.released = true;
    const { threadId } = this.conn;
    this.conn.destroy();
    if (!this.ended && threadId) void this.killQuery(threadId);
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
  }

  private async release() {
    if (this.released) return;
    this.released = true;
    if (!this.readOnly) {
      this.conn.release();
      return;
    }
    try {
      await run(this.conn, READ_WRITE);
      this.conn.release();
    } catch {
      // Never return a connection that may still be read-only to the pool.
      this.conn.destroy();
    }
  }

  private async killQuery(threadId: number): Promise<void> {
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
