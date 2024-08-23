import { replaceDatabaseInConnectionUrl } from "./util";

const tests = [
  {
    desc: "with existing database",
    connectionUrl: "postgres://localhost:27017/test",
    dbName: "newdb",
    expected: "postgres://localhost:27017/newdb",
  },
  {
    desc: "with user and existing database",
    connectionUrl: "postgresql://taylor@localhost:5432/test",
    dbName: "newdb",
    expected: "postgresql://taylor@localhost:5432/newdb",
  },
  {
    desc: "with user, password, and existing database",
    connectionUrl: "postgresql://taylor:pass@localhost:5432/test",
    dbName: "newdb",
    expected: "postgresql://taylor:pass@localhost:5432/newdb",
  },
  {
    desc: "with no database",
    connectionUrl: "postgres://localhost:27017",
    dbName: "newdb",
    expected: "postgres://localhost:27017/newdb",
  },
];

describe("test replaceDatabaseInConnectionUrl", () => {
  tests.forEach(test => {
    it(`should replace the database name in the connection URL ${test.desc}`, () => {
      const result = replaceDatabaseInConnectionUrl(
        test.connectionUrl,
        test.dbName,
      );
      expect(result).toEqual(test.expected);
    });
  });
});
