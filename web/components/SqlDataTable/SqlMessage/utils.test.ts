import { parseQuery } from "./utils";

const tests = [
  {
    q: "call dolt_branch('branch')",
    expected: { databaseName: undefined, branchName: undefined },
  },
  {
    q: "select dolt_branch('branch')",
    expected: { databaseName: undefined, branchName: undefined },
  },
  {
    q: "use `testdb/testbranch`",
    expected: { databaseName: "testdb", branchName: "testbranch" },
  },
  {
    q: "USE `testdb/testbranch`",
    expected: { databaseName: "testdb", branchName: "testbranch" },
  },
  {
    q: "use `testdb/taylor/testbranch`",
    expected: { databaseName: "testdb", branchName: "taylor/testbranch" },
  },
  {
    q: "use `testdb`",
    expected: { databaseName: "testdb", branchName: undefined },
  },
  {
    q: "use testdb",
    expected: { databaseName: "testdb", branchName: undefined },
  },
  {
    q: "call dolt_checkout('testbranch')",
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: "select dolt_checkout('testbranch')",
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: `call dolt_checkout("testbranch")`,
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: `select dolt_checkout("testbranch")`,
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: "call dolt_checkout('-b', 'testbranch')",
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: "select dolt_checkout('-b', 'testbranch')",
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: `call dolt_checkout("-b", "testbranch")`,
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: `select dolt_checkout("-b", "testbranch")`,
    expected: { databaseName: undefined, branchName: "testbranch" },
  },
  {
    q: `call dolt_checkout('-b', "taylor/testbranch")`,
    expected: { databaseName: undefined, branchName: "taylor/testbranch" },
  },
  {
    q: `select dolt_checkout('-b', "taylor/testbranch")`,
    expected: { databaseName: undefined, branchName: "taylor/testbranch" },
  },
  {
    q: `CALL DOLT_CHECKOUT('-b', "taylor/testbranch")`,
    expected: { databaseName: undefined, branchName: "taylor/testbranch" },
  },
  {
    q: `SELECT DOLT_CHECKOUT('-b', "taylor/testbranch")`,
    expected: { databaseName: undefined, branchName: "taylor/testbranch" },
  },
];

describe("test parse query utils", () => {
  tests.forEach(({ q, expected }) =>
    it(`should parse ${q}`, () => {
      const { databaseName, branchName } = parseQuery(q);
      expect(databaseName).toEqual(expected.databaseName);
      expect(branchName).toEqual(expected.branchName);
    }),
  );
});
