import { DatabaseSync } from "@dolthub/doltlite";
import { CursorSink, CursorSource } from "../cursor";
import { RawRow } from "../types";

// Streams a query from its own read-only connection. The factory's shared
// connection can't hold a statement open: on DoltLite the dolt_checkout that
// starts every other request aborts it. Being read-only, the connection
// rejects writes before they do anything, and the cursor then hands the query
// back to the normal path.
export function createSqliteCursorSource(
  path: string,
  queryString: string,
): CursorSource {
  let db: DatabaseSync | undefined;
  let rows: Iterator<unknown> | undefined;
  let sink: CursorSink | undefined;
  let paused = true;
  let pumping = false;

  const release = () => {
    rows?.return?.();
    rows = undefined;
    db?.close();
    db = undefined;
  };

  const pump = () => {
    if (pumping || !sink) return;
    pumping = true;
    try {
      while (!paused && rows) {
        const next = rows.next();
        if (next.done) {
          rows = undefined;
          sink.end();
        } else {
          sink.row(next.value as RawRow);
        }
      }
    } catch (e) {
      rows = undefined;
      sink.error(e as Error);
    } finally {
      pumping = false;
    }
  };

  return {
    writesNothing: true,
    completeBeforeFirstPage: false,
    start(s) {
      sink = s;
      try {
        db = new DatabaseSync(path, { readOnly: true });
        const stmt = db.prepare(queryString);
        if (!stmt.columns().length) {
          throw new Error("statement returns no rows");
        }
        rows = stmt.iterate();
      } catch (e) {
        s.error(e as Error);
        return;
      }
      s.rowSet();
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      pump();
    },
    async finish() {
      release();
      return [];
    },
    abandon() {
      release();
    },
    classify(sets) {
      const first = sets[0] as (typeof sets)[number] | undefined;
      return {
        rows: first && "rows" in first ? first.rows : [],
        isMutation: false,
        executionMessage: "",
      };
    },
  };
}
