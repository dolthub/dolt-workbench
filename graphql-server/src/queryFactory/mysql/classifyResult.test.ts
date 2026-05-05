import { classifyMysqlResult } from "./classifyResult";

describe("classifyMysqlResult", () => {
  describe("SELECT-shaped results: isMutation false, rows preserved", () => {
    const reads = [
      {
        desc: "SELECT with rows",
        result: {
          raw: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
          records: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
          // affected explicitly undefined for SELECT-shaped results
        },
        expectedRows: [
          { id: 1, name: "alice" },
          { id: 2, name: "bob" },
        ],
      },
      {
        desc: "SELECT with zero rows",
        result: { raw: [], records: [] },
        expectedRows: [],
      },
      {
        desc: "SHOW TABLES",
        result: {
          raw: [{ Tables_in_db: "users" }],
          records: [{ Tables_in_db: "users" }],
        },
        expectedRows: [{ Tables_in_db: "users" }],
      },
      {
        desc: "DESCRIBE",
        result: {
          raw: [{ Field: "id", Type: "int" }],
          records: [{ Field: "id", Type: "int" }],
        },
        expectedRows: [{ Field: "id", Type: "int" }],
      },
      {
        desc: "EXPLAIN",
        result: {
          raw: [{ id: 1, select_type: "SIMPLE" }],
          records: [{ id: 1, select_type: "SIMPLE" }],
        },
        expectedRows: [{ id: 1, select_type: "SIMPLE" }],
      },
    ];

    reads.forEach(t => {
      it(t.desc, () => {
        const out = classifyMysqlResult(t.result);
        expect(out.isMutation).toBe(false);
        expect(out.executionMessage).toBe("");
        expect(out.rows).toEqual(t.expectedRows);
      });
    });
  });

  describe("OkPacket results: isMutation true, message built from affectedRows + info", () => {
    const mutations = [
      {
        desc: "INSERT one row, no info",
        result: {
          raw: { affectedRows: 1, info: "" },
          records: [],
          affected: 1,
        },
        expectedMessage: "Query OK, 1 rows affected.",
      },
      {
        desc: "UPDATE with info (replace # with space)",
        result: {
          raw: {
            affectedRows: 3,
            info: "Rows matched: 3#Changed: 3#Warnings: 0",
          },
          records: [],
          affected: 3,
        },
        expectedMessage:
          "Query OK, 3 rows affected.Rows matched: 3 Changed: 3#Warnings: 0",
      },
      {
        desc: "DELETE",
        result: {
          raw: { affectedRows: 5, info: "" },
          records: [],
          affected: 5,
        },
        expectedMessage: "Query OK, 5 rows affected.",
      },
      {
        desc: "DDL: CREATE TABLE (affectedRows 0, no info)",
        result: {
          raw: { affectedRows: 0, info: "" },
          records: [],
          affected: 0,
        },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "raw missing info field",
        result: {
          raw: { affectedRows: 2 },
          records: [],
          affected: 2,
        },
        expectedMessage: "Query OK, 2 rows affected.",
      },
      {
        desc: "raw is null (defensive)",
        result: { raw: null, records: [], affected: 0 },
        expectedMessage: "Query OK, 0 rows affected.",
      },
    ];

    mutations.forEach(t => {
      it(t.desc, () => {
        const out = classifyMysqlResult(t.result);
        expect(out.isMutation).toBe(true);
        expect(out.rows).toEqual([]);
        expect(out.executionMessage).toBe(t.expectedMessage);
      });
    });
  });
});
