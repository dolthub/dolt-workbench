import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DataSource } from "typeorm";
import { getDataSource } from "../../connections/connection.provider";
import { DatabaseType } from "../../databases/database.enum";
import { ROW_LIMIT } from "../../utils";
import * as t from "../types";
import { SqliteQueryFactory } from ".";

let tmpDir: string;
let ds: DataSource;
let qf: SqliteQueryFactory;

const args = { databaseName: "plain", refName: "main" };
const TOTAL = 120;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sqlite-cursor-test-"));
  const dbFile = path.join(tmpDir, "plain.db");
  // A legacy SQLite-format file, which DoltLite can only open, not create.
  execFileSync("sqlite3", [
    dbFile,
    `CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT);
     WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < ${TOTAL})
     INSERT INTO t SELECT i, 'v' || i FROM n;`,
  ]);
  ds = getDataSource({
    name: "plain",
    connectionUrl: `sqlite:${dbFile}`,
    hideDoltFeatures: false,
    useSSL: false,
    type: DatabaseType.Sqlite,
  });
  await ds.initialize();
  qf = new SqliteQueryFactory(ds);
});

afterAll(async () => {
  await qf.destroy();
  await ds.destroy();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("SQL cursor paging against plain SQLite", () => {
  it("pages through the same rows the full query returns", async () => {
    const queryString = "SELECT * FROM t ORDER BY v DESC";
    const full = await qf.getSqlSelect({ ...args, queryString });
    const rows: t.RawRows = [];
    for (let offset = 0; ; offset += ROW_LIMIT) {
      const page = await qf.getSqlSelectPage(
        { ...args, queryString },
        offset,
        ROW_LIMIT,
      );
      if (!page) throw new Error(`no cursor page at offset ${offset}`);
      rows.push(...page.rows.slice(0, ROW_LIMIT));
      if (page.rows.length <= ROW_LIMIT) break;
    }
    expect(rows).toEqual(full.rows);
  });

  it("serves the first page without reading the whole result", async () => {
    const page = await qf.getSqlSelectPage(
      {
        ...args,
        queryString:
          "WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n) SELECT i FROM n",
      },
      0,
      ROW_LIMIT,
    );
    expect(page?.rows).toHaveLength(ROW_LIMIT + 1);
  });

  it("leaves writes to the normal path without running them", async () => {
    const page = await qf.getSqlSelectPage(
      { ...args, queryString: "INSERT INTO t VALUES (9001, 'cursor')" },
      0,
      ROW_LIMIT,
    );
    expect(page).toBeUndefined();
    const rows: t.RawRows = await ds.query(
      "SELECT count(*) AS n FROM t WHERE id = 9001",
    );
    expect(rows[0].n).toBe(0);
  });

  it("keeps reading its snapshot while the shared connection writes", async () => {
    const queryString = "SELECT id, v FROM t WHERE id <= 120 ORDER BY id";
    await qf.getSqlSelectPage({ ...args, queryString }, 0, ROW_LIMIT);
    await ds.query("UPDATE t SET v = 'after-first-page' WHERE id = 110");
    await qf.getSqlSelectPage({ ...args, queryString }, ROW_LIMIT, ROW_LIMIT);
    const last = await qf.getSqlSelectPage(
      { ...args, queryString },
      2 * ROW_LIMIT,
      ROW_LIMIT,
    );
    expect(last?.rows.find(r => r.id === 110)?.v).toBe("v110");
  });

  it("leaves queries to the normal path inside an open transaction", async () => {
    await qf.getSqlSelect({ ...args, queryString: "BEGIN" });
    await qf.getSqlSelect({
      ...args,
      queryString: "DELETE FROM t WHERE id > 10",
    });
    const queryString = "SELECT count(*) AS n FROM t";
    expect(
      await qf.getSqlSelectPage({ ...args, queryString }, 0, ROW_LIMIT),
    ).toBeUndefined();
    expect((await qf.getSqlSelect({ ...args, queryString })).rows).toEqual([
      { n: 10 },
    ]);
    await qf.getSqlSelect({ ...args, queryString: "ROLLBACK" });
  });

  it("leaves queries to the normal path while temp tables exist", async () => {
    await ds.query("CREATE TEMP TABLE t (x INTEGER)");
    const queryString = "SELECT count(*) AS n FROM t";
    expect(
      await qf.getSqlSelectPage({ ...args, queryString }, 0, ROW_LIMIT),
    ).toBeUndefined();
    expect((await qf.getSqlSelect({ ...args, queryString })).rows).toEqual([
      { n: 0 },
    ]);
    await ds.query("DROP TABLE temp.t");
    expect(
      await qf.getSqlSelectPage({ ...args, queryString }, 0, ROW_LIMIT),
    ).toBeDefined();
  });
});
