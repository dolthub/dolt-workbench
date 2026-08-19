import { DataSource, EntityManager } from "typeorm";
import { buildInsertRow } from "./buildInsertRow";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);
const sqliteEm = new EntityManager(
  new DataSource({ type: "better-sqlite3", database: ":memory:", driver: {} }),
);

describe("buildInsertRow", () => {
  describe("mysql", () => {
    it("emits a single-column insert with ? placeholder and matching display SQL", () => {
      const out = buildInsertRow(mysqlEm, "users", [
        { column: "name", value: "alice" },
      ]);
      expect(out.sql).toBe("INSERT INTO `users`(`name`) VALUES (?)");
      expect(out.params).toEqual(["alice"]);
      expect(out.displaySql).toBe(
        "INSERT INTO `users`(`name`) VALUES ('alice')",
      );
    });

    it("emits a multi-column insert with one placeholder per value", () => {
      const out = buildInsertRow(mysqlEm, "users", [
        { column: "id", value: "1", type: "int" },
        { column: "name", value: "alice", type: "varchar(255)" },
      ]);
      expect(out.sql).toBe("INSERT INTO `users`(`id`, `name`) VALUES (?, ?)");
      expect(out.params).toEqual(["1", "alice"]);
      expect(out.displaySql).toBe(
        "INSERT INTO `users`(`id`, `name`) VALUES (1, 'alice')",
      );
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildInsertRow(mysqlEm, "users", [
        { column: "name", value: "O'Hara" },
      ]);
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        "INSERT INTO `users`(`name`) VALUES ('O''Hara')",
      );
    });

    it("emits NULL inline (no placeholder) for null-valued columns", () => {
      const out = buildInsertRow(mysqlEm, "users", [
        { column: "id", value: "1", type: "int" },
        { column: "deleted_at", value: null, type: "datetime" },
      ]);
      expect(out.sql).toBe(
        "INSERT INTO `users`(`id`, `deleted_at`) VALUES (?, NULL)",
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        "INSERT INTO `users`(`id`, `deleted_at`) VALUES (1, NULL)",
      );
    });

    it("emits TRUE/FALSE (unquoted) for boolean column types in display SQL", () => {
      const out = buildInsertRow(mysqlEm, "users", [
        { column: "active", value: "true", type: "boolean" },
      ]);
      expect(out.params).toEqual(["true"]);
      expect(out.displaySql).toBe(
        "INSERT INTO `users`(`active`) VALUES (TRUE)",
      );
    });

    it("treats bigint, decimal, etc. as numeric in display SQL", () => {
      const out = buildInsertRow(mysqlEm, "t", [
        { column: "a", value: "1", type: "bigint" },
        { column: "b", value: "2.5", type: "decimal(10,2)" },
      ]);
      expect(out.displaySql).toBe("INSERT INTO `t`(`a`, `b`) VALUES (1, 2.5)");
    });

    it("falls back to quoted string for non-numeric types and missing type", () => {
      const out = buildInsertRow(mysqlEm, "t", [
        { column: "a", value: "x", type: "varchar(255)" },
        { column: "b", value: "y" },
      ]);
      expect(out.displaySql).toBe(
        "INSERT INTO `t`(`a`, `b`) VALUES ('x', 'y')",
      );
    });

    it("throws when no values are provided", () => {
      expect(() => buildInsertRow(mysqlEm, "users", [])).toThrow(
        /at least one column value/,
      );
    });
  });

  describe("postgres", () => {
    it("emits a single-column insert with $1 placeholder and qualified table", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "name", value: "alice" },
      ]);
      expect(out.sql).toBe('INSERT INTO "public"."users"("name") VALUES ($1)');
      expect(out.params).toEqual(["alice"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("name") VALUES ('alice')`,
      );
    });

    it("emits a multi-column insert with $1, $2, ... placeholders", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "id", value: "1", type: "int" },
        { column: "name", value: "alice", type: "text" },
      ]);
      expect(out.sql).toBe(
        'INSERT INTO "public"."users"("id", "name") VALUES ($1, $2)',
      );
      expect(out.params).toEqual(["1", "alice"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("id", "name") VALUES (1, 'alice')`,
      );
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildInsertRow(pgEm, "analytics.events", [
        { column: "id", value: "1" },
      ]);
      expect(out.sql).toBe(
        'INSERT INTO "analytics"."events"("id") VALUES ($1)',
      );
    });

    it("emits NULL inline (no placeholder) for null-valued columns", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "id", value: "1", type: "int" },
        { column: "deleted_at", value: null, type: "timestamp" },
      ]);
      expect(out.sql).toBe(
        'INSERT INTO "public"."users"("id", "deleted_at") VALUES ($1, NULL)',
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("id", "deleted_at") VALUES (1, NULL)`,
      );
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "name", value: "O'Hara" },
      ]);
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("name") VALUES ('O''Hara')`,
      );
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "id", value: "42", type: "int" },
      ]);
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("id") VALUES (42)`,
      );
    });

    it("emits TRUE/FALSE (unquoted) for boolean column types in display SQL", () => {
      const out = buildInsertRow(pgEm, "public.users", [
        { column: "active", value: "true", type: "boolean" },
      ]);
      expect(out.displaySql).toBe(
        `INSERT INTO "public"."users"("active") VALUES (TRUE)`,
      );
    });

    it("throws when no values are provided", () => {
      expect(() => buildInsertRow(pgEm, "public.users", [])).toThrow(
        /at least one column value/,
      );
    });
  });

  describe("sqlite", () => {
    it("emits double-quoted identifiers with ? placeholders", () => {
      const out = buildInsertRow(sqliteEm, "users", [
        { column: "id", value: "1", type: "int" },
        { column: "name", value: "alice" },
      ]);
      expect(out.sql).toBe(`INSERT INTO "users"("id", "name") VALUES (?, ?)`);
      expect(out.params).toEqual(["1", "alice"]);
      expect(out.displaySql).toBe(
        `INSERT INTO "users"("id", "name") VALUES (1, 'alice')`,
      );
    });
  });
});
