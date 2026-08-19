import {
  dbNameFromFilePath,
  getSqliteDbName,
  getSqliteFilePath,
  replaceDatabaseInConnectionUrl,
} from "./util";

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

describe("test sqlite connection url helpers", () => {
  const sqliteTests = [
    {
      desc: "absolute path",
      connectionUrl: "sqlite:/Users/me/data/mydb.db",
      expectedPath: "/Users/me/data/mydb.db",
      expectedName: "mydb",
    },
    {
      desc: "triple-slash form",
      connectionUrl: "sqlite:///Users/me/data/mydb.db",
      expectedPath: "/Users/me/data/mydb.db",
      expectedName: "mydb",
    },
    {
      desc: "path with spaces",
      connectionUrl: "sqlite:/Users/me/My%20Files/my db.db",
      expectedPath: "/Users/me/My Files/my db.db",
      expectedName: "my db",
    },
    {
      desc: "file without extension",
      connectionUrl: "sqlite:/Users/me/mydb",
      expectedPath: "/Users/me/mydb",
      expectedName: "mydb",
    },
    {
      desc: "path with a literal % that is not a valid escape",
      connectionUrl: "sqlite:/Users/me/50%off.db",
      expectedPath: "/Users/me/50%off.db",
      expectedName: "50%off",
    },
  ];

  sqliteTests.forEach(test => {
    it(`should extract the file path and db name ${test.desc}`, () => {
      expect(getSqliteFilePath(test.connectionUrl)).toEqual(test.expectedPath);
      expect(getSqliteDbName(test.connectionUrl)).toEqual(test.expectedName);
    });
  });

  it("should keep the base name for dotfiles", () => {
    expect(dbNameFromFilePath("/Users/me/.hidden")).toEqual(".hidden");
  });

  it("should handle Windows-style backslash paths", () => {
    expect(dbNameFromFilePath("C:\\Users\\me\\mydb.db")).toEqual("mydb");
    expect(dbNameFromFilePath("C:\\Users\\me/mixed/mydb.db")).toEqual("mydb");
  });
});
