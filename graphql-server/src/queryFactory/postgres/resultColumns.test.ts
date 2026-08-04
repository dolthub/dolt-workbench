import { QueryRunner } from "typeorm";
import { PgFieldDef, resolvePgResultColumns } from "./resultColumns";

function fakeQr(query: jest.Mock): QueryRunner {
  return { query } as unknown as QueryRunner;
}

function fieldDef(overrides: Partial<PgFieldDef>): PgFieldDef {
  return {
    name: "col",
    tableID: 0,
    ...overrides,
  };
}

describe("resolvePgResultColumns", () => {
  it("returns undefined for missing or empty fields", async () => {
    const query = jest.fn();
    expect(
      await resolvePgResultColumns(fakeQr(query), undefined),
    ).toBeUndefined();
    expect(await resolvePgResultColumns(fakeQr(query), [])).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });

  it("resolves table oids to source table names", async () => {
    const query = jest.fn().mockResolvedValue([
      { oid: 100, relname: "users" },
      { oid: 200, relname: "orders" },
    ]);
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100 }),
      fieldDef({ name: "renamed", tableID: 100 }),
      fieldDef({ name: "total", tableID: 200 }),
    ]);
    expect(out).toEqual([
      { name: "id", sourceTable: "users" },
      { name: "renamed", sourceTable: "users" },
      { name: "total", sourceTable: "orders" },
    ]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([[100, 200]]);
  });

  it("handles string oids in query results", async () => {
    const query = jest
      .fn()
      .mockResolvedValue([{ oid: "100", relname: "users" }]);
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100 }),
    ]);
    expect(out?.[0].sourceTable).toBe("users");
  });

  it("skips the lookup when no fields reference a table", async () => {
    const query = jest.fn();
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "?column?", tableID: 0 }),
    ]);
    expect(query).not.toHaveBeenCalled();
    expect(out).toEqual([{ name: "?column?" }]);
  });

  it("degrades to bare column names when the lookup fails", async () => {
    const query = jest.fn().mockRejectedValue(new Error("no pg_class"));
    const out = await resolvePgResultColumns(fakeQr(query), [
      fieldDef({ name: "id", tableID: 100 }),
    ]);
    expect(out).toEqual([{ name: "id" }]);
  });
});
