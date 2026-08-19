import { classifySqliteResult } from "./classifyResult";

describe("classifySqliteResult", () => {
  it("classifies a reader result as rows", () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const res = classifySqliteResult({ raw: rows, records: rows });
    expect(res).toEqual({
      rows,
      isMutation: false,
      executionMessage: "",
    });
  });

  it("classifies an empty reader result", () => {
    const res = classifySqliteResult({ raw: [], records: [] });
    expect(res).toEqual({ rows: [], isMutation: false, executionMessage: "" });
  });

  it("classifies a mutation result with affected rows", () => {
    const res = classifySqliteResult({ raw: 5, affected: 2 });
    expect(res.isMutation).toBe(true);
    expect(res.rows).toEqual([]);
    expect(res.executionMessage).toBe("Query OK, 2 rows affected.");
  });

  it("classifies a zero-row mutation (e.g. DDL)", () => {
    const res = classifySqliteResult({ raw: 0, affected: 0 });
    expect(res.isMutation).toBe(true);
    expect(res.executionMessage).toBe("Query OK, 0 rows affected.");
  });

  it("handles bigint lastInsertRowid in raw", () => {
    const res = classifySqliteResult({ raw: BigInt(9), affected: 1 });
    expect(res.isMutation).toBe(true);
    expect(res.executionMessage).toBe("Query OK, 1 row affected.");
  });
});
