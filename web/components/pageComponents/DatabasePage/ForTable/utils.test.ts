import { getFakeInt, getRandomDateOrTime, getRandomText } from "./utils";

describe("test insert query utils", () => {
  it("gets fake int for type", () => {
    const tests = [
      { type: "INT", maxInt: 2147483647 },
      { type: "INT UNSIGNED", maxInt: 2147483647 },
      { type: "BIGINT", maxInt: 2 ** 62 },
      { type: "BIGINT UNSIGNED", maxInt: 2 ** 62 },
      { type: "MEDIUMINT", maxInt: 8388607 },
      { type: "MEDIUMINT UNSIGNED", maxInt: 8388607 },
      { type: "SMALLINT", maxInt: 32767 },
      { type: "SMALLINT UNSIGNED", maxInt: 32767 },
      { type: "TINYINT", maxInt: 127 },
      { type: "TINYINT UNSIGNED", maxInt: 127 },
    ];
    tests.forEach(test => {
      expect(getFakeInt(test.type)).toBeLessThan(test.maxInt);
    });
  });

  it("gets random date or time", () => {
    const timeRegex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/; // HH:MM:SS
    const dateRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD
    const datetimeRegex =
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])\s(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/; // YYYY-MM-DD HH:MM:SS
    const tests = [
      { type: "time", regex: timeRegex },
      { type: "date", regex: dateRegex },
      { type: "datetime", regex: datetimeRegex },
      { type: "timestamp", regex: datetimeRegex },
    ];
    tests.forEach(test => {
      expect(getRandomDateOrTime(test.type)).toMatch(test.regex);
    });
  });

  it("gets random text", () => {
    const tests = [
      { type: "longtext", maxChars: 4294967295 },
      { type: "mediumtext", maxChars: 16777215 },
      { type: "tinytext", maxChars: 255 },
      { type: "varchar(255)", maxChars: 200 },
      { type: "char(2)", maxChars: 2 },
      { type: "varchar(1)", maxChars: 1 },
      { type: "char(10)", maxChars: 10 },
      { type: "char(24)", maxChars: 24 },
      { type: "varchar(100)", maxChars: 100 },
    ];
    tests.forEach(test => {
      const text = getRandomText(test.type);
      const removeQuotes = text.slice(1, -1);
      expect(removeQuotes.length).toBeLessThanOrEqual(test.maxChars);
    });
  });
});
