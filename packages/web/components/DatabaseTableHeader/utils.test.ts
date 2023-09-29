import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { sampleQuery } from "./utils";

const idPKColumn: ColumnForDataTableFragment = {
  name: "id",
  isPrimaryKey: true,
  type: "INT",
};

const pkPKColumn: ColumnForDataTableFragment = {
  name: "pk2",
  isPrimaryKey: true,
  type: "INT",
};

const nameColumn: ColumnForDataTableFragment = {
  name: "name",
  isPrimaryKey: false,
  type: "VARCHAR(16383)",
};

describe("tests sampleQuery", () => {
  const tests: Array<{
    desc: string;
    cols: ColumnForDataTableFragment[];
    expectedQuery: string;
    expectedShowLink: boolean;
    tableName?: string;
  }> = [
    {
      desc: "Keyless table",
      cols: [nameColumn],
      expectedQuery: `SELECT *\nFROM \`Keyless table\`\nLIMIT 200;\n`,
      expectedShowLink: false,
      tableName: "Keyless table",
    },
    {
      desc: "One key and data",
      cols: [idPKColumn, nameColumn],
      expectedQuery: `SELECT *\nFROM \`One key and data table\`\nORDER BY \`id\` ASC\nLIMIT 200;\n`,
      expectedShowLink: true,
      tableName: "One key and data table",
    },
    {
      desc: "Two Key",
      cols: [idPKColumn, pkPKColumn],
      expectedQuery: `SELECT *\nFROM \`Two Keys table\`\nORDER BY \`id\` ASC, \`pk2\` ASC\nLIMIT 200;\n`,
      expectedShowLink: true,
      tableName: "Two Keys table",
    },
    {
      desc: "Two Keys and data",
      cols: [idPKColumn, pkPKColumn, nameColumn],
      expectedQuery: `SELECT *\nFROM \`Two Keys and data table\`\nORDER BY \`id\` ASC, \`pk2\` ASC\nLIMIT 200;\n`,
      expectedShowLink: true,
      tableName: "Two Keys and data table",
    },
    {
      desc: "no table Name",
      cols: [idPKColumn, pkPKColumn, nameColumn],
      expectedShowLink: false,
      expectedQuery: `SHOW TABLES;\n`,
    },
  ];

  tests.forEach(test => {
    it(`tests ${test.desc} table default query`, () => {
      const { sqlQuery, showDefaultQueryInfo } = sampleQuery(
        test.tableName,
        test.cols,
      );
      expect(sqlQuery).toContain(test.expectedQuery);
      expect(showDefaultQueryInfo).toBe(test.expectedShowLink);
    });
  });
});
