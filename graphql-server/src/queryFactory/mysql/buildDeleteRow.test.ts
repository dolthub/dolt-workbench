import { buildMysqlDeleteRow, quoteMysqlId } from "./buildDeleteRow";

describe("quoteMysqlId", () => {
  it("wraps a plain identifier in backticks", () => {
    expect(quoteMysqlId("users")).toBe("`users`");
  });

  it("escapes embedded backticks by doubling", () => {
    expect(quoteMysqlId("a`b")).toBe("`a``b`");
  });
});

describe("buildMysqlDeleteRow", () => {
  it("emits a single-PK delete with placeholder and matching display SQL", () => {
    const out = buildMysqlDeleteRow({
      tableName: "users",
      where: [{ column: "id", value: "42" }],
    });
    expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
    expect(out.params).toEqual(["42"]);
    expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = '42'");
  });

  it("emits a composite-PK delete with AND-joined predicates", () => {
    const out = buildMysqlDeleteRow({
      tableName: "assignments",
      where: [
        { column: "challenge_id", value: "1" },
        { column: "assignment", value: "x" },
      ],
    });
    expect(out.sql).toBe(
      "DELETE FROM `assignments` WHERE `challenge_id` = ? AND `assignment` = ?",
    );
    expect(out.params).toEqual(["1", "x"]);
    expect(out.displaySql).toBe(
      "DELETE FROM `assignments` WHERE `challenge_id` = '1' AND `assignment` = 'x'",
    );
  });

  it("escapes single quotes in the display SQL value", () => {
    const out = buildMysqlDeleteRow({
      tableName: "users",
      where: [{ column: "name", value: "O'Hara" }],
    });
    expect(out.params).toEqual(["O'Hara"]);
    expect(out.displaySql).toBe("DELETE FROM `users` WHERE `name` = 'O''Hara'");
  });

  it("escapes embedded backticks in identifiers", () => {
    const out = buildMysqlDeleteRow({
      tableName: "weird`table",
      where: [{ column: "id`col", value: "1" }],
    });
    expect(out.sql).toBe("DELETE FROM `weird``table` WHERE `id``col` = ?");
  });

  it("throws when no where clauses are provided", () => {
    expect(() =>
      buildMysqlDeleteRow({ tableName: "users", where: [] }),
    ).toThrow(/at least one where clause/);
  });
});
