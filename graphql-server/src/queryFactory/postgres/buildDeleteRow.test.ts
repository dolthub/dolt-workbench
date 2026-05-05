import { buildPgDeleteRow, quotePgId } from "./buildDeleteRow";

describe("quotePgId", () => {
  it("wraps a plain identifier in double quotes", () => {
    expect(quotePgId("users")).toBe('"users"');
  });

  it("escapes embedded double-quotes by doubling", () => {
    expect(quotePgId('a"b')).toBe('"a""b"');
  });
});

describe("buildPgDeleteRow", () => {
  it("emits a single-PK delete with $1 placeholder and matching display SQL", () => {
    const out = buildPgDeleteRow({
      tableName: "users",
      schemaName: "public",
      where: [{ column: "id", value: "42" }],
    });
    expect(out.sql).toBe('DELETE FROM "public"."users" WHERE "id" = $1');
    expect(out.params).toEqual(["42"]);
    expect(out.displaySql).toBe(
      `DELETE FROM "public"."users" WHERE "id" = '42'`,
    );
  });

  it("emits a composite-PK delete with $1, $2, ... AND-joined", () => {
    const out = buildPgDeleteRow({
      tableName: "assignments",
      schemaName: "public",
      where: [
        { column: "challenge_id", value: "1" },
        { column: "assignment", value: "x" },
      ],
    });
    expect(out.sql).toBe(
      'DELETE FROM "public"."assignments" WHERE "challenge_id" = $1 AND "assignment" = $2',
    );
    expect(out.params).toEqual(["1", "x"]);
    expect(out.displaySql).toBe(
      `DELETE FROM "public"."assignments" WHERE "challenge_id" = '1' AND "assignment" = 'x'`,
    );
  });

  it("uses the supplied schemaName (non-public)", () => {
    const out = buildPgDeleteRow({
      tableName: "events",
      schemaName: "analytics",
      where: [{ column: "id", value: "1" }],
    });
    expect(out.sql).toBe('DELETE FROM "analytics"."events" WHERE "id" = $1');
  });

  it("escapes single quotes in the display SQL value", () => {
    const out = buildPgDeleteRow({
      tableName: "users",
      schemaName: "public",
      where: [{ column: "name", value: "O'Hara" }],
    });
    expect(out.params).toEqual(["O'Hara"]);
    expect(out.displaySql).toBe(
      `DELETE FROM "public"."users" WHERE "name" = 'O''Hara'`,
    );
  });

  it("escapes embedded double-quotes in identifiers", () => {
    const out = buildPgDeleteRow({
      tableName: 'weird"table',
      schemaName: "public",
      where: [{ column: 'id"col', value: "1" }],
    });
    expect(out.sql).toBe(
      'DELETE FROM "public"."weird""table" WHERE "id""col" = $1',
    );
  });

  it("throws when no where clauses are provided", () => {
    expect(() =>
      buildPgDeleteRow({
        tableName: "users",
        schemaName: "public",
        where: [],
      }),
    ).toThrow(/at least one where clause/);
  });
});
