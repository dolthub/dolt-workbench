import { Query } from "pg";
import { CursorSink, CursorSource, ResultSet } from "../cursor";
import { RawRow } from "../types";
import {
  ClassifiedResult,
  PgQueryResult,
  classifyPgResult,
} from "./classifyResult";

type PgResult = { command?: string; rowCount?: number | null };

type PgQuery = {
  on(event: "row", cb: (row: RawRow) => void): PgQuery;
  on(event: "error", cb: (e: Error) => void): PgQuery;
  on(event: "end", cb: (res: PgResult) => void): PgQuery;
};

type PgClient = {
  processID?: number;
  connection: {
    stream: { pause(): void; resume(): void };
    once(event: "parseComplete", cb: () => void): void;
    removeListener(event: "parseComplete", cb: () => void): void;
  };
  query(q: unknown, values?: unknown[]): Promise<{ rows: RawRow[] }>;
};

export type PgConnection = [PgClient, (err?: unknown) => void];

export type PgCursorOptions = {
  // Statements run before the cursor's statement (USE, search_path).
  setup: string[];
  // Postgres enforces read-only sessions, so writes are rejected before they
  // start and re-run on the normal path, and abandoned reads can be
  // cancelled. Doltgres enforces neither read-only sessions (it still runs
  // DDL and dolt functions in one) nor cancellation, and streams an
  // INSERT ... RETURNING's rows before committing it. So its statements
  // finish before their first page, and only those it rejected before
  // executing (parse errors, such as multi-statement strings) re-run.
  readOnly: boolean;
};

const READ_ONLY = "SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY";
const READ_WRITE = "SET SESSION CHARACTERISTICS AS TRANSACTION READ WRITE";

export async function createPgCursorSource(
  getConn: () => Promise<PgConnection>,
  sql: string,
  opts: PgCursorOptions,
): Promise<CursorSource | undefined> {
  const [client, release] = await getConn();
  try {
    for (const s of opts.readOnly ? [...opts.setup, READ_ONLY] : opts.setup) {
      // eslint-disable-next-line no-await-in-loop
      await client.query(s);
    }
  } catch {
    release(true);
    return undefined;
  }
  return new PgCursorSource(client, release, getConn, sql, opts.readOnly);
}

class PgCursorSource implements CursorSource {
  readonly writesNothing: boolean;

  readonly completeBeforeFirstPage: boolean;

  private result: PgResult | undefined;

  private ended = false;

  private released = false;

  constructor(
    private readonly client: PgClient,
    private readonly releaseClient: (err?: unknown) => void,
    private readonly getConn: () => Promise<PgConnection>,
    private readonly sql: string,
    private readonly readOnly: boolean,
  ) {
    this.writesNothing = readOnly;
    this.completeBeforeFirstPage = !readOnly;
  }

  start(sink: CursorSink) {
    let sawRow = false;
    let parsed = false;
    const onParsed = () => {
      parsed = true;
    };
    this.client.connection.once("parseComplete", onParsed);
    const q: PgQuery = new Query({ text: this.sql, queryMode: "extended" });
    q.on("row", row => {
      if (!sawRow) {
        sawRow = true;
        sink.rowSet();
      }
      sink.row(row);
    })
      .on("error", e => {
        this.ended = true;
        this.client.connection.removeListener("parseComplete", onParsed);
        sink.error(e, !parsed);
      })
      .on("end", res => {
        this.result = res;
        this.ended = true;
        if (!sawRow) sink.status(res);
        sink.end();
      });
    void this.client.query(q);
  }

  pause() {
    this.client.connection.stream.pause();
  }

  resume() {
    this.client.connection.stream.resume();
  }

  async finish(): Promise<string[]> {
    await this.release();
    return [];
  }

  // The connection is destroyed rather than pooled, so a cancel that arrives
  // late can't interrupt whoever uses it next.
  abandon() {
    if (this.released) return;
    this.released = true;
    const pid = this.client.processID;
    this.releaseClient(new Error("cursor abandoned"));
    if (this.readOnly && !this.ended && pid) void this.cancel(pid);
  }

  classify(sets: ResultSet[]): ClassifiedResult {
    const set = sets[0] as ResultSet | undefined;
    const res: PgQueryResult = {
      command: this.result?.command,
      rowCount: this.result?.rowCount,
      rows: set && "rows" in set ? set.rows : [],
    };
    return classifyPgResult(res);
  }

  private async release() {
    if (this.released) return;
    this.released = true;
    this.resume();
    try {
      if (this.readOnly) await this.client.query(READ_WRITE);
      this.releaseClient();
    } catch (e) {
      // Never return a connection that may still be read-only to the pool.
      this.releaseClient(e ?? true);
    }
  }

  private async cancel(pid: number): Promise<void> {
    try {
      const [killer, release] = await this.getConn();
      try {
        await killer.query("SELECT pg_cancel_backend($1)", [pid]);
      } finally {
        release();
      }
    } catch {
      // Best effort: the statement may have already finished.
    }
  }
}
