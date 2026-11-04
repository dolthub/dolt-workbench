import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DataSource } from "typeorm";
import { ConnectionProvider } from "../../connections/connection.provider";
import { doltliteDriver } from "../../connections/doltliteDriver";
import { SqlSelectResolver } from "../../sqlSelects/sqlSelect.resolver";
import { ROW_LIMIT } from "../../utils";
import { DoltLiteQueryFactory } from "../doltlite";
import { SqliteQueryFactory } from "../sqlite";
import * as t from "../types";

let tmpDir: string;
let ds: DataSource;
let qf: DoltLiteQueryFactory;

const main = { databaseName: "testdb", refName: "main" };
const TOTAL = 120;

async function allPages(
  factory: SqliteQueryFactory,
  args: t.RefArgs,
  queryString: string,
): Promise<t.RawRows> {
  const rows: t.RawRows = [];
  for (let offset = 0; ; offset += ROW_LIMIT) {
    // eslint-disable-next-line no-await-in-loop
    const page = await factory.getSqlSelectPage(
      { ...args, queryString },
      offset,
      ROW_LIMIT,
    );
    if (!page) throw new Error(`no cursor page at offset ${offset}`);
    rows.push(...page.rows.slice(0, ROW_LIMIT));
    if (page.rows.length <= ROW_LIMIT) return rows;
  }
}

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cursor-test-"));
  const dbFile = path.join(tmpDir, "testdb.db");
  fs.writeFileSync(dbFile, "");
  ds = new DataSource({
    type: "better-sqlite3",
    database: dbFile,
    driver: doltliteDriver,
    fileMustExist: true,
    statementCacheSize: 0,
    synchronize: false,
  });
  await ds.initialize();
  await ds.query("CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)");
  await ds.query(
    `WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < ${TOTAL})
     INSERT INTO t SELECT i, 'v' || i FROM n`,
  );
  await ds.query("SELECT dolt_commit('-Am', 'seed')");
  await ds.query("SELECT dolt_tag('v1')");
  qf = new DoltLiteQueryFactory(ds);
});

afterAll(async () => {
  await qf.destroy();
  await ds.destroy();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("SQL cursor paging against doltlite", () => {
  it("pages through the same rows the full query returns", async () => {
    const q = "SELECT * FROM t ORDER BY v DESC";
    const full = await qf.getSqlSelect({ ...main, queryString: q });
    expect(await allPages(qf, main, q)).toEqual(full.rows);
  });

  it("signals the last page with no lookahead row", async () => {
    const args = { ...main, queryString: "SELECT * FROM t WHERE id <= 120" };
    const lengths: number[] = [];
    for (const offset of [0, 50, 100]) {
      // eslint-disable-next-line no-await-in-loop
      const page = await qf.getSqlSelectPage(args, offset, ROW_LIMIT);
      lengths.push(page?.rows.length ?? -1);
    }
    expect(lengths).toEqual([ROW_LIMIT + 1, ROW_LIMIT + 1, 20]);
  });

  it("returns undefined for an offset the open cursor isn't at", async () => {
    const queryString = "SELECT id FROM t ORDER BY id";
    await qf.getSqlSelectPage({ ...main, queryString }, 0, ROW_LIMIT);
    expect(
      await qf.getSqlSelectPage({ ...main, queryString }, 100, ROW_LIMIT),
    ).toBeUndefined();
  });

  it("leaves writes to the normal path without running them", async () => {
    const page = await qf.getSqlSelectPage(
      { ...main, queryString: "INSERT INTO t VALUES (9001, 'cursor')" },
      0,
      ROW_LIMIT,
    );
    expect(page).toBeUndefined();
    const rows: t.RawRows = await ds.query(
      "SELECT count(*) AS n FROM t WHERE id = 9001",
    );
    expect(rows[0].n).toBe(0);
  });

  it("leaves errors to the normal path", async () => {
    expect(
      await qf.getSqlSelectPage(
        { ...main, queryString: "SELEC nope" },
        0,
        ROW_LIMIT,
      ),
    ).toBeUndefined();
  });

  it("serves later pages without re-executing the query", async () => {
    const queryString = "SELECT id, v FROM t WHERE id <= 120 ORDER BY id";
    await qf.getSqlSelectPage({ ...main, queryString }, 0, ROW_LIMIT);
    await ds.query("UPDATE t SET v = 'after-first-page' WHERE id = 110");
    await qf.getSqlSelectPage({ ...main, queryString }, 50, ROW_LIMIT);
    const last = await qf.getSqlSelectPage(
      { ...main, queryString },
      100,
      ROW_LIMIT,
    );
    expect(last?.rows.find(r => r.id === 110)?.v).toBe("v110");
  });

  it("reads a branch's uncommitted working set", async () => {
    await qf.createNewBranch({
      ...main,
      branchName: "feat",
      fromRefName: "main",
    });
    await qf.getSqlSelect({
      databaseName: "testdb",
      refName: "feat",
      queryString: "INSERT INTO t VALUES (5000, 'feat-only')",
    });
    const q = "SELECT v FROM t WHERE id = 5000";
    const onFeat = await qf.getSqlSelectPage(
      { databaseName: "testdb", refName: "feat", queryString: q },
      0,
      ROW_LIMIT,
    );
    expect(onFeat?.rows).toEqual([{ v: "feat-only" }]);
    const onMain = await qf.getSqlSelectPage(
      { ...main, queryString: q },
      0,
      ROW_LIMIT,
    );
    expect(onMain?.rows).toEqual([]);
  });

  it("reads tags through a detached revision", async () => {
    const page = await qf.getSqlSelectPage(
      {
        databaseName: "testdb",
        refName: "v1",
        queryString: "SELECT count(*) AS n FROM t",
      },
      0,
      ROW_LIMIT,
    );
    expect(page?.rows).toEqual([{ n: TOTAL }]);
  });

  it("serves the first page without reading the whole result", async () => {
    const page = await qf.getSqlSelectPage(
      {
        ...main,
        queryString:
          "WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n) SELECT i FROM n",
      },
      0,
      ROW_LIMIT,
    );
    expect(page?.rows).toHaveLength(ROW_LIMIT + 1);
  });

  it("runs RETURNING writes once through the normal path", async () => {
    const page = await qf.getSqlSelectPage(
      {
        ...main,
        queryString: "UPDATE t SET v = v || '!' WHERE id = 7 RETURNING v",
      },
      0,
      ROW_LIMIT,
    );
    expect(page).toBeUndefined();
    const res = await qf.getSqlSelect({
      ...main,
      queryString: "UPDATE t SET v = v || '!' WHERE id = 7 RETURNING v",
    });
    expect(res.rows).toEqual([{ v: "v7!" }]);
  });

  it("runs Dolt procedures through the normal path", async () => {
    const page = await qf.getSqlSelectPage(
      { ...main, queryString: "SELECT dolt_branch('from-cursor')" },
      0,
      ROW_LIMIT,
    );
    expect(page).toBeUndefined();
    const rows: t.RawRows = await ds.query(
      "SELECT count(*) AS n FROM dolt_branches WHERE name = 'from-cursor'",
    );
    expect(rows[0].n).toBe(0);
  });

  it("reads HEAD as the commit, not the working set", async () => {
    await ds.query("INSERT INTO t VALUES (7000, 'uncommitted')");
    const head = { databaseName: "testdb", refName: "HEAD" };
    const queryString = "SELECT count(*) AS n FROM t WHERE id = 7000";
    const page = await qf.getSqlSelectPage(
      { ...head, queryString },
      0,
      ROW_LIMIT,
    );
    const normal = await qf.getSqlSelect({ ...head, queryString });
    expect(page?.rows).toEqual(normal.rows);
    expect(page?.rows).toEqual([{ n: 0 }]);
    await ds.query("DELETE FROM t WHERE id = 7000");
  });

  it("lets the shared connection write while a cursor is open", async () => {
    const queryString = "SELECT id FROM t WHERE id < 200 ORDER BY id";
    const first = await qf.getSqlSelectPage(
      { ...main, queryString },
      0,
      ROW_LIMIT,
    );
    expect(first?.rows[0]).toEqual({ id: 1 });

    const write = await qf.getSqlSelect({
      ...main,
      queryString: "UPDATE t SET v = 'changed' WHERE id = 120",
    });
    expect(write.isMutation).toBe(true);

    const second = await qf.getSqlSelectPage(
      { ...main, queryString },
      ROW_LIMIT,
      ROW_LIMIT,
    );
    expect(second?.rows[0]).toEqual({ id: ROW_LIMIT + 1 });
    const rows: t.RawRows = await ds.query("SELECT v FROM t WHERE id = 120");
    expect(rows[0].v).toBe("changed");
  });
});

describe("SqlSelectResolver with cursor paging", () => {
  const resolver = new SqlSelectResolver({
    connection: () => qf,
  } as unknown as ConnectionProvider);

  it("pages a select to the end", async () => {
    const queryString = "SELECT id FROM t WHERE id <= 120 ORDER BY id";
    const ids: string[] = [];
    let offset: number | undefined = 0;
    while (offset !== undefined) {
      // eslint-disable-next-line no-await-in-loop
      const res = await resolver.sqlSelect({ ...main, queryString, offset });
      ids.push(...res.rows.list.map(r => r.columnValues[0].displayValue));
      offset = res.rows.nextOffset ?? undefined;
    }
    expect(ids).toHaveLength(TOTAL);
    expect(ids[TOTAL - 1]).toBe(120);
  });

  it("runs writes through the normal path exactly once", async () => {
    const res = await resolver.sqlSelect({
      ...main,
      queryString: "INSERT INTO t VALUES (9002, 'resolver')",
    });
    expect(res.isMutation).toBe(true);
    expect(res.queryExecutionMessage).toMatch(/1 row affected/);
    const rows: t.RawRows = await ds.query(
      "SELECT count(*) AS n FROM t WHERE id = 9002",
    );
    expect(rows[0].n).toBe(1);
  });

  it("reports errors from the normal path", async () => {
    await expect(
      resolver.sqlSelect({ ...main, queryString: "SELECT * FROM missing" }),
    ).rejects.toThrow(/missing/);
    await expect(
      resolver.sqlSelect({ ...main, queryString: "SELEC nope" }),
    ).rejects.toThrow(/syntax error/);
  });
});
