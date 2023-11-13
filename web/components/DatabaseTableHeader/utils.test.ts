import { sampleQuery } from "./utils";

describe("tests sampleQuery", () => {
  const tests: Array<{
    desc: string;
    expectedQuery: string;
    tableName?: string;
  }> = [
    {
      desc: "Keyless table",
      expectedQuery: `SELECT * FROM \`Keyless table\``,
      tableName: "Keyless table",
    },
    {
      desc: "One key and data",
      expectedQuery: `SELECT * FROM \`One key and data table\``,
      tableName: "One key and data table",
    },
    {
      desc: "Two Key",
      expectedQuery: `SELECT * FROM \`Two Keys table\``,
      tableName: "Two Keys table",
    },
    {
      desc: "Two Keys and data",
      expectedQuery: `SELECT * FROM \`Two Keys and data table\``,
      tableName: "Two Keys and data table",
    },
    {
      desc: "no table Name",
      expectedQuery: `SHOW TABLES;\n`,
    },
  ];

  tests.forEach(test => {
    it(`tests ${test.desc} table default query`, () => {
      const sqlQuery = sampleQuery(test.tableName);
      expect(sqlQuery).toContain(test.expectedQuery);
    });
  });
});
