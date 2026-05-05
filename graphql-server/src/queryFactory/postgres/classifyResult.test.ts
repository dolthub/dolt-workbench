import { classifyPgResult } from "./classifyResult";

describe("classifyPgResult", () => {
  describe("read commands return rows, isMutation: false, no message", () => {
    const reads = [
      {
        desc: "SELECT with rows",
        res: {
          command: "SELECT",
          rows: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
          rowCount: 2,
        },
        expectedRows: [
          { id: 1, name: "alice" },
          { id: 2, name: "bob" },
        ],
      },
      {
        desc: "SELECT with zero rows",
        res: { command: "SELECT", rows: [], rowCount: 0 },
        expectedRows: [],
      },
      {
        desc: "SHOW",
        res: {
          command: "SHOW",
          rows: [{ search_path: '"$user", public' }],
          rowCount: 1,
        },
        expectedRows: [{ search_path: '"$user", public' }],
      },
      {
        desc: "EXPLAIN",
        res: {
          command: "EXPLAIN",
          rows: [{ "QUERY PLAN": "Seq Scan on users" }],
          rowCount: 1,
        },
        expectedRows: [{ "QUERY PLAN": "Seq Scan on users" }],
      },
      {
        desc: "DESCRIBE (Doltgres)",
        res: {
          command: "DESCRIBE",
          rows: [{ Field: "id", Type: "int" }],
          rowCount: 1,
        },
        expectedRows: [{ Field: "id", Type: "int" }],
      },
    ];

    reads.forEach(t => {
      it(t.desc, () => {
        const out = classifyPgResult(t.res);
        expect(out.isMutation).toBe(false);
        expect(out.executionMessage).toBe("");
        expect(out.rows).toEqual(t.expectedRows);
      });
    });
  });

  describe("mutation commands return empty rows, isMutation: true, with message", () => {
    const mutations = [
      {
        desc: "INSERT (no RETURNING)",
        res: { command: "INSERT", rows: [], rowCount: 1 },
        expectedMessage: "Query OK, 1 rows affected.",
      },
      {
        desc: "INSERT with RETURNING (still mutation: command stays INSERT)",
        res: { command: "INSERT", rows: [{ id: 99 }], rowCount: 1 },
        expectedMessage: "Query OK, 1 rows affected.",
      },
      {
        desc: "UPDATE",
        res: { command: "UPDATE", rows: [], rowCount: 5 },
        expectedMessage: "Query OK, 5 rows affected.",
      },
      {
        desc: "DELETE",
        res: { command: "DELETE", rows: [], rowCount: 3 },
        expectedMessage: "Query OK, 3 rows affected.",
      },
      {
        desc: "CREATE TABLE",
        res: { command: "CREATE", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "DROP TABLE",
        res: { command: "DROP", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "ALTER TABLE",
        res: { command: "ALTER", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "TRUNCATE",
        res: { command: "TRUNCATE", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "SET",
        res: { command: "SET", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "BEGIN",
        res: { command: "BEGIN", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "COMMIT",
        res: { command: "COMMIT", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "unknown command (defaults to mutation)",
        res: { command: "REINDEX", rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
      {
        desc: "missing command (defaults to mutation)",
        res: { rows: [], rowCount: null },
        expectedMessage: "Query OK, 0 rows affected.",
      },
    ];

    mutations.forEach(t => {
      it(t.desc, () => {
        const out = classifyPgResult(t.res);
        expect(out.isMutation).toBe(true);
        expect(out.rows).toEqual([]);
        expect(out.executionMessage).toBe(t.expectedMessage);
      });
    });
  });
});
