import { QueryRunner } from "typeorm";
import { PgFieldDef, resolvePgResultColumns } from "./resultColumns";

function fakeQr(query: jest.Mock): QueryRunner {
  return { query } as unknown as QueryRunner;
}

function fieldDef(overrides: Partial<PgFieldDef>): PgFieldDef {
  return {
    name: "col",
    tableID: 0,
    columnID: 0,
    dataTypeID: 23,
    ...overrides,
  };
}

describe("resolvePgResultColumns", () => {
  it("returns undefined for missing or empty fields", async () => {
    const query = jest.fn();
    expect(await resolvePgResultColumns(fakeQr(query), undefined)).toBeUndefined();
    expect(await resolvePgResultColumns(fakeQr(query), [])).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });

  it("maps table columns to name, pk, type, and sourceTable", async () => {
    const query = jest.fn().mockResolvedValue([
      {
        table_oid: 100,
        table_name: "users",
        attnum: 1,
        col_type: "int4",
        is_pk: true,
      },
      {
        table_oid: 100,
        table_name: "users",
        attnum: 2,
        col_type: "varchar",
        is_pk: false,
      },
    ]);
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100, columnID: 1 }),
      fieldDef({ name: "renamed", tableID: 100, columnID: 2 }),
    ]);
    expect(out).toEqual([
      { name: "id", isPrimaryKey: true, type: "int4", sourceTable: "users" },
      {
        name: "renamed",
        isPrimaryKey: false,
        type: "varchar",
        sourceTable: "users",
      },
    ]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([[100]]);
  });

  it("handles doltgres-style 't' booleans for is_pk", async () => {
    const query = jest.fn().mockResolvedValue([
      {
        table_oid: 100,
        table_name: "users",
        attnum: 1,
        col_type: "int4",
        is_pk: "t",
      },
    ]);
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100, columnID: 1 }),
    ]);
    expect(out?.[0].isPrimaryKey).toBe(true);
  });

  it("skips the catalog lookup when no fields reference a table", async () => {
    const query = jest.fn();
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "?column?", tableID: 0, columnID: 0 }),
    ]);
    expect(query).not.toHaveBeenCalled();
    expect(out).toEqual([
      { name: "?column?", isPrimaryKey: false, type: "unknown" },
    ]);
  });

  it("dedupes table oids in the catalog lookup", async () => {
    const query = jest.fn().mockResolvedValue([]);
    await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "a", tableID: 100, columnID: 1 }),
      fieldDef({ name: "b", tableID: 100, columnID: 2 }),
      fieldDef({ name: "c", tableID: 200, columnID: 1 }),
    ]);
    expect(query.mock.calls[0][1]).toEqual([[100, 200]]);
  });

  it("degrades to bare column names when the catalog lookup fails", async () => {
    const query = jest.fn().mockRejectedValue(new Error("no pg_index"));
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100, columnID: 1 }),
    ]);
    expect(out).toEqual([
      { name: "id", isPrimaryKey: false, type: "unknown" },
    ]);
  });
});
