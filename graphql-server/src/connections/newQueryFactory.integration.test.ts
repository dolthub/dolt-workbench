import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DataSource } from "typeorm";
import { DatabaseType } from "../databases/database.enum";
import { DoltLiteQueryFactory } from "../queryFactory/doltlite";
import { SqliteQueryFactory } from "../queryFactory/sqlite";
import { getDataSource, newQueryFactory } from "./connection.provider";

let tmpDir: string;
let legacyFixture: string;
const sources: DataSource[] = [];

// DoltLite only creates prolly-format databases, so a legacy SQLite-format
// fixture has to come from the sqlite3 CLI (preinstalled on macOS and the
// ubuntu CI runners).
function generateLegacyFixture(dbFile: string): void {
  execFileSync("sqlite3", [
    dbFile,
    `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
     INSERT INTO users VALUES (1,'alice'),(2,'bob');
     CREATE VIEW user_names AS SELECT name FROM users;`,
  ]);
}

async function openSqlite(
  dbFile: string,
): Promise<{ qf: SqliteQueryFactory; isDolt: boolean; ds: DataSource }> {
  const ds = getDataSource({
    name: "test",
    connectionUrl: `sqlite:${dbFile}`,
    hideDoltFeatures: false,
    useSSL: false,
    type: DatabaseType.Sqlite,
  });
  await ds.initialize();
  sources.push(ds);
  const { qf, isDolt } = await newQueryFactory(DatabaseType.Sqlite, ds);
  return { qf: qf as SqliteQueryFactory, isDolt, ds };
}

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qf-detection-test-"));
  legacyFixture = path.join(tmpDir, "legacy-fixture.db");
  generateLegacyFixture(legacyFixture);
});

afterAll(async () => {
  for (const ds of sources) {
    if (ds.isInitialized) await ds.destroy();
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("newQueryFactory format detection", () => {
  it("selects DoltLiteQueryFactory for a prolly-format database", async () => {
    const dbFile = path.join(tmpDir, "prolly.db");
    fs.writeFileSync(dbFile, "");
    const seed = await openSqlite(dbFile);
    await seed.ds.query("CREATE TABLE t (id INTEGER PRIMARY KEY)");

    const { qf, isDolt } = await openSqlite(dbFile);
    expect(qf).toBeInstanceOf(DoltLiteQueryFactory);
    expect(isDolt).toBe(true);
  });

  it("selects SqliteQueryFactory for a legacy-format database", async () => {
    const dbFile = path.join(tmpDir, "legacy.db");
    fs.copyFileSync(legacyFixture, dbFile);

    const { qf, isDolt } = await openSqlite(dbFile);
    expect(qf).toBeInstanceOf(SqliteQueryFactory);
    expect(qf).not.toBeInstanceOf(DoltLiteQueryFactory);
    expect(isDolt).toBe(false);
  });

  it("reads and writes a legacy-format database", async () => {
    const dbFile = path.join(tmpDir, "legacy-rw.db");
    fs.copyFileSync(legacyFixture, dbFile);
    const { qf } = await openSqlite(dbFile);
    const dbArgs = { databaseName: "legacy-rw", refName: "main" };

    expect(await qf.getTableNames(dbArgs)).toEqual(["users"]);

    const info = await qf.getTableInfo({ ...dbArgs, tableName: "users" });
    expect(info?.columns.map(c => c.name)).toEqual(["id", "name"]);

    const select = await qf.getSqlSelect({
      ...dbArgs,
      queryString: "SELECT * FROM users ORDER BY id",
    });
    expect(select.rows).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ]);

    const insert = await qf.insertRow({
      ...dbArgs,
      tableName: "users",
      values: [
        { column: "id", value: "3", type: "int" },
        { column: "name", value: "carol" },
      ],
    });
    expect(insert.rowsAffected).toEqual(1);

    const schemas = await qf.getSchemas(dbArgs);
    expect(schemas.map(s => s.name)).toEqual(["user_names"]);
  });
});
