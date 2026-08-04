import { FieldPacket } from "mysql2";
import { classifyMysqlResult, mapFieldsToColumns } from "./classifyResult";

function field(
  overrides: Partial<Omit<FieldPacket, "constructor">>,
): FieldPacket {
  return {
    catalog: "def",
    decimals: 0,
    flags: 0,
    name: "col",
    orgName: "col",
    orgTable: "",
    table: "",
    ...overrides,
  } as FieldPacket;
}

describe("classifyMysqlResult", () => {
  describe("SELECT-shaped results: isMutation false, rows preserved", () => {
    const reads = [
      {
        desc: "SELECT with rows",
        raw: [
          { id: 1, name: "alice" },
          { id: 2, name: "bob" },
        ],
        expectedRows: [
          { id: 1, name: "alice" },
          { id: 2, name: "bob" },
        ],
      },
      {
        desc: "SELECT with zero rows",
        raw: [],
        expectedRows: [],
      },
      {
        desc: "SHOW TABLES",
        raw: [{ Tables_in_db: "users" }],
        expectedRows: [{ Tables_in_db: "users" }],
      },
      {
        desc: "DESCRIBE",
        raw: [{ Field: "id", Type: "int" }],
        expectedRows: [{ Field: "id", Type: "int" }],
      },
      {
        desc: "EXPLAIN",
        raw: [{ id: 1, select_type: "SIMPLE" }],
        expectedRows: [{ id: 1, select_type: "SIMPLE" }],
      },
    ];

    reads.forEach(t => {
      it(t.desc, () => {
        const out = classifyMysqlResult(t.raw);
        expect(out.isMutation).toBe(false);
        expect(out.executionMessage).toBe("");
        expect(out.rows).toEqual(t.expectedRows);
        expect(out.columns).toBeUndefined();
      });
    });

    it("maps field packets to columns", () => {
      const out = classifyMysqlResult(
        [{ id: 1, name: "alice" }],
        [
          field({ name: "id", orgName: "id", orgTable: "users" }),
          field({ name: "name", orgName: "name", orgTable: "users" }),
        ],
      );
      expect(out.columns).toEqual([
        { name: "id", sourceTable: "users" },
        { name: "name", sourceTable: "users" },
      ]);
    });
  });

  describe("OkPacket results: isMutation true, message built from affectedRows + info", () => {
    const mutations = [
      {
        desc: "INSERT one row, no info",
        raw: { affectedRows: 1, info: "" },
        expectedMessage: "Query OK, 1 row affected.",
      },
      {
        desc: "UPDATE with info (replace # with space)",
        raw: {
          affectedRows: 3,
          info: "Rows matched: 3#Changed: 3#Warnings: 0",
        },
        expectedMessage:
          "Query OK, 3 rows affected.Rows matched: 3 Changed: 3#Warnings: 0",
      },
      {
        desc: "DELETE",
        raw: { affectedRows: 5, info: "" },
        expectedMessage: "Query OK, 5 rows affected.",
      },
      {
        desc: "DDL: CREATE TABLE (affectedRows 0, no info)",
        raw: { affectedRows: 0, info: "" },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "raw missing info field",
        raw: { affectedRows: 2 },
        expectedMessage: "Query OK, 2 rows affected.",
      },
      {
        desc: "raw is null (defensive)",
        raw: null,
        expectedMessage: "Query OK, 0 rows affected.",
      },
    ];

    mutations.forEach(t => {
      it(t.desc, () => {
        const out = classifyMysqlResult(t.raw);
        expect(out.isMutation).toBe(true);
        expect(out.rows).toEqual([]);
        expect(out.executionMessage).toBe(t.expectedMessage);
      });
    });
  });
});

describe("mapFieldsToColumns", () => {
  it("returns undefined for missing or empty fields", () => {
    expect(mapFieldsToColumns(undefined)).toBeUndefined();
    expect(mapFieldsToColumns([])).toBeUndefined();
  });

  it("omits sourceTable for computed columns", () => {
    const out = mapFieldsToColumns([field({ name: "1+1", orgTable: "" })]);
    expect(out?.[0].sourceTable).toBeUndefined();
  });
});
