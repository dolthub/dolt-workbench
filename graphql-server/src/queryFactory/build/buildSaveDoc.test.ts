import { DataSource, EntityManager } from "typeorm";
import { doltliteDriver } from "../../connections/doltliteDriver";
import { buildSaveDoc } from "./buildSaveDoc";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);
const sqliteEm = new EntityManager(
  new DataSource({
    type: "better-sqlite3",
    database: ":memory:",
    driver: doltliteDriver,
  }),
);

describe("buildSaveDoc", () => {
  it("emits MySQL upsert via ON DUPLICATE KEY UPDATE", () => {
    const out = buildSaveDoc(mysqlEm, "dolt_docs", "README.md", "hello");
    expect(out.sql).toBe(
      "INSERT INTO `dolt_docs` (`doc_name`, `doc_text`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `doc_text` = VALUES(`doc_text`)",
    );
    expect(out.params).toEqual(["README.md", "hello"]);
    expect(out.displaySql).toBe(
      "INSERT INTO `dolt_docs` (`doc_name`, `doc_text`) VALUES ('README.md', 'hello') ON DUPLICATE KEY UPDATE `doc_text` = VALUES(`doc_text`)",
    );
  });

  it("emits Postgres upsert via ON CONFLICT DO UPDATE", () => {
    const out = buildSaveDoc(pgEm, "dolt_docs", "README.md", "hello");
    expect(out.sql).toBe(
      'INSERT INTO "dolt_docs" ("doc_name", "doc_text") VALUES ($1, $2) ON CONFLICT ("doc_name") DO UPDATE SET "doc_text" = $2',
    );
    expect(out.params).toEqual(["README.md", "hello"]);
    expect(out.displaySql).toBe(
      'INSERT INTO "dolt_docs" ("doc_name", "doc_text") VALUES (\'README.md\', \'hello\') ON CONFLICT ("doc_name") DO UPDATE SET "doc_text" = \'hello\'',
    );
  });

  it("emits SQLite upsert via INSERT OR REPLACE", () => {
    const out = buildSaveDoc(sqliteEm, "dolt_docs", "README.md", "hello");
    expect(out.sql).toBe(
      'INSERT OR REPLACE INTO "dolt_docs" ("doc_name", "doc_text") VALUES (?, ?)',
    );
    expect(out.params).toEqual(["README.md", "hello"]);
    expect(out.displaySql).toBe(
      'INSERT OR REPLACE INTO "dolt_docs" ("doc_name", "doc_text") VALUES (\'README.md\', \'hello\')',
    );
  });

  it("escapes single quotes in markdown for displaySql", () => {
    const out = buildSaveDoc(mysqlEm, "dolt_docs", "README.md", "don't");
    expect(out.params).toEqual(["README.md", "don't"]);
    expect(out.displaySql).toContain("'don''t'");
  });
});
