import { SqlSelectForSqlDataTableQuery } from "@gen/graphql-types";
import {
  PendingSqlResult,
  clearPendingSqlResult,
  peekPendingSqlResult,
  pendingSqlResultMatches,
  setPendingSqlResult,
  subscribePendingSqlResult,
} from "./pendingSqlResult";

const data = {} as SqlSelectForSqlDataTableQuery;

const result: PendingSqlResult = {
  variables: {
    databaseName: "dbname",
    refName: "main",
    queryString: "SELECT * FROM t",
  },
  data,
};

const params = {
  databaseName: "dbname",
  refName: "main",
  q: "SELECT * FROM t",
};

describe("pendingSqlResult", () => {
  afterEach(() => {
    clearPendingSqlResult();
  });

  it("peeks what was set and clears", () => {
    expect(peekPendingSqlResult()).toBeUndefined();
    setPendingSqlResult(result);
    expect(peekPendingSqlResult()).toBe(result);
    expect(peekPendingSqlResult()).toBe(result);
    clearPendingSqlResult();
    expect(peekPendingSqlResult()).toBeUndefined();
  });

  it("notifies subscribers on set until unsubscribed", () => {
    const onSet = jest.fn();
    const unsubscribe = subscribePendingSqlResult(onSet);
    setPendingSqlResult(result);
    expect(onSet).toHaveBeenCalledTimes(1);
    unsubscribe();
    setPendingSqlResult(result);
    expect(onSet).toHaveBeenCalledTimes(1);
  });

  it("matches params from the url round-trip", () => {
    expect(pendingSqlResultMatches(result, params)).toBe(true);
    expect(
      pendingSqlResultMatches(result, { ...params, q: "SELECT * FROM other" }),
    ).toBe(false);
    expect(
      pendingSqlResultMatches(result, { ...params, refName: "feature" }),
    ).toBe(false);
    expect(
      pendingSqlResultMatches(result, { ...params, schemaName: "public" }),
    ).toBe(false);
  });

  it("treats null, undefined, and empty-string schemaName as equal", () => {
    const withNullSchema = {
      ...result,
      variables: { ...result.variables, schemaName: null },
    };
    expect(pendingSqlResultMatches(withNullSchema, params)).toBe(true);
    expect(
      pendingSqlResultMatches(withNullSchema, { ...params, schemaName: "" }),
    ).toBe(true);
    expect(pendingSqlResultMatches(result, { ...params, schemaName: "" })).toBe(
      true,
    );
  });
});
