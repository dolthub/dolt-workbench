import { isLongContentType, splitEnumOptions } from ".";

describe("test split enum", () => {
  it("splits enum", () => {
    expect(splitEnumOptions("ENUM('option-a','option-b)")).toEqual([
      "option-a",
      "option-b",
    ]);
  });
});

describe("test isLongContentType", () => {
  const tests: Array<{
    colType: string;
    expectedTypeCheck: boolean;
  }> = [
    {
      colType: "INT",
      expectedTypeCheck: false,
    },
    {
      colType: "BIGINT",
      expectedTypeCheck: false,
    },
    {
      colType: "MEDIUMINT",
      expectedTypeCheck: false,
    },
    {
      colType: "TINYINT",
      expectedTypeCheck: false,
    },
    {
      colType: "SMALLINT",
      expectedTypeCheck: false,
    },
    {
      colType: "FLOAT",
      expectedTypeCheck: false,
    },
    {
      colType: "DOUBLE",
      expectedTypeCheck: false,
    },
    {
      colType: "TEXT",
      expectedTypeCheck: true,
    },
    {
      colType: "TINYTEXT",
      expectedTypeCheck: false,
    },
    {
      colType: "LONGTEXT",
      expectedTypeCheck: true,
    },
    {
      colType: "BLOB",
      expectedTypeCheck: false,
    },
    {
      colType: "VARCHAR(255)",
      expectedTypeCheck: true,
    },
    {
      colType: "VARCHAR(10)",
      expectedTypeCheck: false,
    },
    {
      colType: "ENUM",
      expectedTypeCheck: false,
    },
    {
      colType: "DATE",
      expectedTypeCheck: false,
    },
    {
      colType: "DATETIME",
      expectedTypeCheck: false,
    },
    {
      colType: "TIMESTAMP",
      expectedTypeCheck: false,
    },
    {
      colType: "YEAR",
      expectedTypeCheck: false,
    },
  ];

  tests.forEach(test => {
    it(`tests isLongContentType for ${test.colType}`, () => {
      expect(isLongContentType(test.colType)).toEqual(test.expectedTypeCheck);
    });
  });
});
