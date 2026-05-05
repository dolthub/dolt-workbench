import { buildDeleteRow } from "./buildDeleteRow";
import { MYSQL_DIALECT, PG_DIALECT } from "./dialect";

describe("buildDeleteRow", () => {
  describe("MYSQL_DIALECT", () => {
    it("emits a single-PK delete with ? placeholder and matching display SQL", () => {
      const out = buildDeleteRow(
        { tableName: "users", where: [{ column: "id", value: "42" }] },
        MYSQL_DIALECT,
      );
      expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = '42'");
    });

    it("emits a composite-PK delete with AND-joined predicates", () => {
      const out = buildDeleteRow(
        {
          tableName: "assignments",
          where: [
            { column: "challenge_id", value: "1" },
            { column: "assignment", value: "x" },
          ],
        },
        MYSQL_DIALECT,
      );
      expect(out.sql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = ? AND `assignment` = ?",
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = '1' AND `assignment` = 'x'",
      );
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(
        { tableName: "users", where: [{ column: "name", value: "O'Hara" }] },
        MYSQL_DIALECT,
      );
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `users` WHERE `name` = 'O''Hara'",
      );
    });

    it("escapes embedded backticks in identifiers", () => {
      const out = buildDeleteRow(
        {
          tableName: "weird`table",
          where: [{ column: "id`col", value: "1" }],
        },
        MYSQL_DIALECT,
      );
      expect(out.sql).toBe("DELETE FROM `weird``table` WHERE `id``col` = ?");
    });

    it("ignores schemaName (mysql has no schema qualification)", () => {
      const out = buildDeleteRow(
        {
          tableName: "users",
          schemaName: "ignored",
          where: [{ column: "id", value: "1" }],
        },
        MYSQL_DIALECT,
      );
      expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(
        {
          tableName: "users",
          where: [{ column: "id", value: "42", type: "int" }],
        },
        MYSQL_DIALECT,
      );
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = 42");
    });

    it("treats bigint, decimal, etc. as numeric", () => {
      const out = buildDeleteRow(
        {
          tableName: "t",
          where: [
            { column: "a", value: "1", type: "bigint" },
            { column: "b", value: "2.5", type: "decimal(10,2)" },
          ],
        },
        MYSQL_DIALECT,
      );
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 1 AND `b` = 2.5",
      );
    });

    it("falls back to quoted string for non-numeric types and missing type", () => {
      const out = buildDeleteRow(
        {
          tableName: "t",
          where: [
            { column: "a", value: "x", type: "varchar(255)" },
            { column: "b", value: "y" },
          ],
        },
        MYSQL_DIALECT,
      );
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 'x' AND `b` = 'y'",
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildDeleteRow({ tableName: "users", where: [] }, MYSQL_DIALECT),
      ).toThrow(/at least one where clause/);
    });
  });

  describe("PG_DIALECT", () => {
    it("emits a single-PK delete with $1 placeholder and qualified table", () => {
      const out = buildDeleteRow(
        {
          tableName: "users",
          schemaName: "public",
          where: [{ column: "id", value: "42" }],
        },
        PG_DIALECT,
      );
      expect(out.sql).toBe('DELETE FROM "public"."users" WHERE "id" = $1');
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = '42'`,
      );
    });

    it("emits a composite-PK delete with $1, $2, ... AND-joined", () => {
      const out = buildDeleteRow(
        {
          tableName: "assignments",
          schemaName: "public",
          where: [
            { column: "challenge_id", value: "1" },
            { column: "assignment", value: "x" },
          ],
        },
        PG_DIALECT,
      );
      expect(out.sql).toBe(
        'DELETE FROM "public"."assignments" WHERE "challenge_id" = $1 AND "assignment" = $2',
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."assignments" WHERE "challenge_id" = '1' AND "assignment" = 'x'`,
      );
    });

    it("uses the supplied schemaName (non-public)", () => {
      const out = buildDeleteRow(
        {
          tableName: "events",
          schemaName: "analytics",
          where: [{ column: "id", value: "1" }],
        },
        PG_DIALECT,
      );
      expect(out.sql).toBe('DELETE FROM "analytics"."events" WHERE "id" = $1');
    });

    it("defaults to public when schemaName is omitted", () => {
      const out = buildDeleteRow(
        { tableName: "users", where: [{ column: "id", value: "1" }] },
        PG_DIALECT,
      );
      expect(out.sql).toBe('DELETE FROM "public"."users" WHERE "id" = $1');
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(
        {
          tableName: "users",
          schemaName: "public",
          where: [{ column: "name", value: "O'Hara" }],
        },
        PG_DIALECT,
      );
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "name" = 'O''Hara'`,
      );
    });

    it("escapes embedded double-quotes in identifiers", () => {
      const out = buildDeleteRow(
        {
          tableName: 'weird"table',
          schemaName: "public",
          where: [{ column: 'id"col', value: "1" }],
        },
        PG_DIALECT,
      );
      expect(out.sql).toBe(
        'DELETE FROM "public"."weird""table" WHERE "id""col" = $1',
      );
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(
        {
          tableName: "users",
          schemaName: "public",
          where: [{ column: "id", value: "42", type: "int" }],
        },
        PG_DIALECT,
      );
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = 42`,
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildDeleteRow(
          { tableName: "users", schemaName: "public", where: [] },
          PG_DIALECT,
        ),
      ).toThrow(/at least one where clause/);
    });
  });
});
