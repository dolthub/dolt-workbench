import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DataSource } from "typeorm";
import { doltliteDriver } from "../../connections/doltliteDriver";
import { SchemaType } from "../../schemas/schema.enums";
import { SqliteQueryFactory } from ".";

let tmpDir: string;
let ds: DataSource;
let qf: SqliteQueryFactory;

const dbArgs = { databaseName: "testdb", refName: "main" };

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sqlite-qf-test-"));
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
  await ds.query(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
  );
  await ds.query("CREATE VIEW user_names AS SELECT name FROM users");
  qf = new SqliteQueryFactory(ds);
});

afterAll(async () => {
  await ds.destroy();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("SqliteQueryFactory against a real doltlite database", () => {
  it("reports the database name from the file path", async () => {
    expect(await qf.databases()).toEqual(["testdb"]);
    expect(await qf.currentDatabase()).toEqual("testdb");
  });

  it("throws on createDatabase", async () => {
    await expect(qf.createDatabase({ databaseName: "other" })).rejects.toThrow(
      /Cannot create a database/,
    );
  });

  it("lists table names from sqlite_master", async () => {
    expect(await qf.getTableNames(dbArgs)).toEqual(["users"]);
  });

  it("introspects table info via PRAGMA-based getTable", async () => {
    const info = await qf.getTableInfo({ ...dbArgs, tableName: "users" });
    expect(info?.tableName).toEqual("users");
    const cols = info?.columns.map(c => c.name);
    expect(cols).toEqual(["id", "name"]);
    const pk = info?.columns.find(c => c.name === "id");
    expect(pk?.isPrimaryKey).toBe(true);
  });

  it("gets primary key columns", async () => {
    expect(
      await qf.getTablePKColumns({ ...dbArgs, tableName: "users" }),
    ).toEqual(["id"]);
  });

  it("inserts a row through the dialect-neutral builder", async () => {
    const res = await qf.insertRow({
      ...dbArgs,
      tableName: "users",
      values: [
        { column: "id", value: "1", type: "int" },
        { column: "name", value: "alice" },
      ],
    });
    expect(res.rowsAffected).toEqual(1);
    expect(res.queryString).toEqual(
      `INSERT INTO "users"("id", "name") VALUES (1, 'alice')`,
    );
  });

  it("updates a row through the dialect-neutral builder", async () => {
    const res = await qf.updateRow({
      ...dbArgs,
      tableName: "users",
      set: [{ column: "name", value: "bob" }],
      where: [{ column: "id", value: "1", type: "int" }],
    });
    expect(res.rowsAffected).toEqual(1);
  });

  it("classifies a select via getSqlSelect", async () => {
    const res = await qf.getSqlSelect({
      ...dbArgs,
      queryString: "SELECT * FROM users",
    });
    expect(res.isMutation).toBe(false);
    expect(res.rows).toEqual([{ id: 1, name: "bob" }]);
  });

  it("classifies a mutation via getSqlSelect", async () => {
    const res = await qf.getSqlSelect({
      ...dbArgs,
      queryString: "INSERT INTO users VALUES (2, 'carol')",
    });
    expect(res.isMutation).toBe(true);
    expect(res.executionMessage).toEqual("Query OK, 1 row affected.");
  });

  it("returns views and triggers from getSchemas", async () => {
    const schemas = await qf.getSchemas({ databaseName: "testdb" });
    expect(schemas).toEqual([{ name: "user_names", type: SchemaType.View }]);
  });

  it("returns the schema definition from sqlite_master", async () => {
    const res = await qf.schemaDefinition({
      ...dbArgs,
      name: "users",
      kind: SchemaType.Table,
    });
    expect(res.rows[0].sql).toContain("CREATE TABLE users");
  });

  it("returns no procedures and rejects procedure calls", async () => {
    expect(await qf.getProcedures({ databaseName: "testdb" })).toEqual([]);
    await expect(
      qf.callProcedure({ ...dbArgs, name: "foo", args: [] }),
    ).rejects.toThrow(/Stored procedures are not supported/);
  });

  it("selects table rows with pagination", async () => {
    const rows = await qf.getTableRows(
      { ...dbArgs, tableName: "users" },
      { pkCols: ["id"], offset: 0 },
    );
    expect(rows.length).toEqual(2);
  });

  it("serializes interleaved queries through the mutex", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, async (_, i) =>
        qf.getSqlSelect({
          ...dbArgs,
          queryString: `SELECT ${i} AS n`,
        }),
      ),
    );
    results.forEach((res, i) => {
      expect(res.rows).toEqual([{ n: i }]);
    });
  });

  it("drops a column via ALTER TABLE DROP COLUMN", async () => {
    await ds.query("CREATE TABLE tmp (a INTEGER PRIMARY KEY, b TEXT)");
    const res = await qf.dropColumn({
      ...dbArgs,
      tableName: "tmp",
      columnName: "b",
    });
    expect(res.queryString).toEqual(`ALTER TABLE "tmp" DROP COLUMN "b"`);
    const info = await qf.getTableInfo({ ...dbArgs, tableName: "tmp" });
    expect(info?.columns.map(c => c.name)).toEqual(["a"]);
  });
});
