import {
  filterOutEmptyRowsAndCols,
  getColumnLetterFromAlphabet,
} from "./utils";
import { isNumeric } from "./validate";

describe("test editable table utils", () => {
  it("filters out empty rows and columns", () => {
    const tests: Array<{ rows: string[][]; filtered: string[][] }> = [
      {
        rows: [
          ["", ""],
          ["", ""],
        ],
        filtered: [],
      },
      {
        rows: [
          ["a", "b"],
          ["", ""],
        ],
        filtered: [["a", "b"]],
      },
      {
        rows: [
          ["a", "b", ""],
          ["c", "", ""],
        ],
        filtered: [
          ["a", "b"],
          ["c", ""],
        ],
      },
      {
        rows: [
          ["a", "b", "c"],
          ["c", "", ""],
          ["c", "d", ""],
        ],
        filtered: [
          ["a", "b", "c"],
          ["c", "", ""],
          ["c", "d", ""],
        ],
      },
      {
        rows: [
          ["a", "b", "", ""],
          ["c", "d", "e", ""],
          ["f", "g", "", ""],
        ],
        filtered: [
          ["a", "b", ""],
          ["c", "d", "e"],
          ["f", "g", ""],
        ],
      },
      {
        rows: [
          ["a", "b", "", ""],
          ["c", "d", "", "e"],
          ["f", "g", "", ""],
        ],
        filtered: [
          ["a", "b", ""],
          ["c", "d", "e"],
          ["f", "g", ""],
        ],
      },
    ];
    tests.forEach(test => {
      expect(filterOutEmptyRowsAndCols(test.rows)).toEqual(test.filtered);
    });
  });

  it("gets the column letter from the alphabet", () => {
    const tests: Array<{ index: number; letter: string }> = [
      { index: 0, letter: "A" },
      { index: 2, letter: "C" },
      { index: 25, letter: "Z" },
      { index: 26, letter: "AA" },
      { index: 28, letter: "AC" },
      { index: 51, letter: "AZ" },
      { index: 52, letter: "BA" },
    ];
    tests.forEach(test => {
      expect(getColumnLetterFromAlphabet(test.index)).toEqual(test.letter);
    });
  });

  const areNumbers = [
    "1",
    "392324329",
    "3243.34232",
    "0",
    "-23920321762",
    " 10",
  ];
  const notNumbers = ["", " ", "a", "esr234", "232a", "a0"];

  areNumbers.forEach(num => {
    it(`"${num}" is numeric`, () => {
      expect(isNumeric(num)).toBeTruthy();
    });
  });
  notNumbers.forEach(notNum => {
    it(`"${notNum}" is not numeric`, () => {
      expect(isNumeric(notNum)).toBeFalsy();
    });
  });
});
