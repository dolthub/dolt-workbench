import {
  CellHistoryContext,
  encodeCellHistory,
  parseCellHistory,
} from "./cellHistoryUrl";

describe("encodeCellHistory and parseCellHistory", () => {
  it("round-trips a cell context", () => {
    const ctx: CellHistoryContext = {
      tableName: "mytable",
      schemaName: "myschema",
      pkValues: [{ column: "id", value: "1" }],
      columnName: "name",
    };
    expect(parseCellHistory(encodeCellHistory(ctx))).toEqual(ctx);
  });

  it("round-trips a row context with compound primary key", () => {
    const ctx: CellHistoryContext = {
      tableName: "mytable",
      schemaName: undefined,
      pkValues: [
        { column: "pk1", value: "a" },
        { column: "pk2", value: "b" },
      ],
      columnName: undefined,
    };
    expect(parseCellHistory(encodeCellHistory(ctx))).toEqual(ctx);
  });

  it("round-trips special characters in pk columns and values", () => {
    const ctx: CellHistoryContext = {
      tableName: "mytable",
      schemaName: undefined,
      pkValues: [
        { column: "col.with.dots", value: "value:with:colons" },
        { column: "col:with:colons", value: "value.with.dots" },
        { column: "col with spaces", value: "a&b=c?d/e%f" },
      ],
      columnName: "col",
    };
    expect(parseCellHistory(encodeCellHistory(ctx))).toEqual(ctx);
  });

  it("round-trips empty and null pk values", () => {
    const encoded = encodeCellHistory({
      tableName: "mytable",
      pkValues: [
        { column: "pk1", value: "" },
        { column: "pk2", value: null },
      ],
    });
    expect(parseCellHistory(encoded)?.pkValues).toEqual([
      { column: "pk1", value: "" },
      { column: "pk2", value: "" },
    ]);
  });

  it("omits pk param when there are no pk values", () => {
    const encoded = encodeCellHistory({ tableName: "mytable", pkValues: [] });
    expect(encoded.historyPk).toBeUndefined();
    expect(parseCellHistory(encoded)).toEqual({
      tableName: "mytable",
      schemaName: undefined,
      pkValues: [],
      columnName: undefined,
    });
  });

  it("handles a single pk value passed as a string query param", () => {
    expect(
      parseCellHistory({ historyTable: "mytable", historyPk: "id:1" }),
    ).toEqual({
      tableName: "mytable",
      schemaName: undefined,
      pkValues: [{ column: "id", value: "1" }],
      columnName: undefined,
    });
  });

  it("returns undefined without a table name", () => {
    expect(parseCellHistory({})).toBeUndefined();
    expect(parseCellHistory({ historyCell: "col" })).toBeUndefined();
  });
});
