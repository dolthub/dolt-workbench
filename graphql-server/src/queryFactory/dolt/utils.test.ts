import { pkValuesWithTypes } from "./utils";

const columns = [
  { name: "tenant_id", isPrimaryKey: true, type: "int" },
  { name: "order_id", isPrimaryKey: true, type: "int" },
  { name: "status", isPrimaryKey: false, type: "varchar(255)" },
];

describe("pkValuesWithTypes", () => {
  it("fills in types from table columns", () => {
    expect(
      pkValuesWithTypes(
        [
          { column: "tenant_id", value: "1" },
          { column: "order_id", value: "42", type: "bigint" },
        ],
        columns,
      ),
    ).toEqual([
      { column: "tenant_id", value: "1", type: "int" },
      { column: "order_id", value: "42", type: "bigint" },
    ]);
  });

  it("throws when pk values are missing", () => {
    expect(() =>
      pkValuesWithTypes([{ column: "tenant_id", value: "1" }], columns),
    ).toThrow(
      "expected values for primary keys (tenant_id, order_id), got (tenant_id)",
    );
  });

  it("throws when a value targets a non-pk column", () => {
    expect(() =>
      pkValuesWithTypes(
        [
          { column: "tenant_id", value: "1" },
          { column: "status", value: "open" },
        ],
        columns,
      ),
    ).toThrow("expected values for primary keys (tenant_id, order_id)");
  });

  it("throws for extra pk values", () => {
    expect(() =>
      pkValuesWithTypes(
        [
          { column: "tenant_id", value: "1" },
          { column: "order_id", value: "42" },
          { column: "order_id", value: "43" },
        ],
        columns,
      ),
    ).toThrow("expected values for primary keys (tenant_id, order_id)");
  });
});
