import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newExpectationWithTypeString,
  newShouldArgs,
} from "../helpers";
import { Expectation, Tests } from "../types";

export const beVisibleAndContain = (value: string | string[]) =>
  newShouldArgs("be.visible.and.contain", value);

function getDesc(dataCy: string): string {
  return dataCy.replace(/-/g, " ");
}

export const beVisible = newShouldArgs("be.visible");
export const notBeVisible = newShouldArgs("not.be.visible");
export const beExist = newShouldArgs("exist");
export const notExist = newShouldArgs("not.exist");
export const haveLengthAtLeast = (length: number) =>
  newShouldArgs("be.visible.and.have.length.of.at.least", length);
export const beEnabled = newShouldArgs("be.enabled");
export const beDisabled = newShouldArgs("be.disabled");

export const shouldBeVisible = (dataCy: string, desc?: string): Expectation =>
  newExpectation(
    `should find ${desc ?? getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    beVisible,
  );

export const shouldNotBeVisible = (
  dataCy: string,
  desc?: string,
): Expectation =>
  newExpectation(
    `should not find ${desc ?? getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    notBeVisible,
  );

export const shouldNotExist = (dataCy: string): Expectation =>
  newExpectation(
    `should not find ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    notExist,
  );

export const shouldFindAndContain = (
  dataCy: string,
  text: string | string[],
  desc?: string,
): Expectation =>
  newExpectation(
    `should find ${desc ?? getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    beVisibleAndContain(text),
  );

export const shouldClickAndFind = (
  dataCyToClick: string,
  dataCyToFind: string,
): Expectation =>
  newExpectationWithClickFlows(
    `should find and click ${getDesc(dataCyToClick)}`,
    `[data-cy=${dataCyToClick}]`,
    beVisible,
    [
      newClickFlow(`[data-cy=${dataCyToClick}]`, [
        shouldBeVisible(dataCyToFind),
      ]),
    ],
  );

export const shouldTypeString = (dataCy: string, value: string) =>
  newExpectationWithTypeString(
    `should type in ${getDesc(dataCy)} input`,
    `[data-cy=${dataCy}]`,
    beVisible,
    { value },
  );

export const shouldFindButton = (
  dataCy: string,
  disabled = false,
): Expectation =>
  newExpectation(
    `should find${disabled ? "disabled" : "enabled"} ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    disabled ? beDisabled : beEnabled,
  );

export const shouldFindCheckable = (
  dataCy: string,
  checked: boolean,
  disabled = false,
): Expectation[] => [
  shouldBeVisible(dataCy),
  newExpectation(
    `should find ${checked ? "" : "un"}checked ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}] input`,
    newShouldArgs(`${checked ? "" : "not."}be.checked`),
  ),
  newExpectation(
    `should find ${disabled ? "disabled" : "enabled"} ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}] input`,
    newShouldArgs(disabled ? "be.disabled" : "be.enabled"),
  ),
];

export function checkValueInGridTests(grids: string[][]): Tests {
  const tests: Tests = [];
  grids.forEach((row: string[], rowidx: number) => {
    row.forEach((val: string, colidx: number) => {
      tests.push(
        newExpectation(
          `should have value in row ${rowidx} in column ${colidx}`,
          `[aria-rowindex="${rowidx + 2}"]>[aria-colindex="${colidx + 2}"]`,
          beVisibleAndContain(val),
        ),
      );
    });
  });
  return tests;
}

// type function for spreadsheet input
export function getTypeInGridTests(
  grids: string[][],
  skipClear = false,
): Tests {
  const tests: Tests = [];
  grids.forEach((row: string[], rowidx: number) => {
    row.forEach((val: string, colidx: number) => {
      tests.push(
        newExpectationWithTypeString(
          `should enter value in row ${rowidx} in column ${colidx}`,
          `[aria-rowindex="${rowidx + 2}"]>[aria-colindex="${colidx + 2}"]`,
          beVisible,
          // The first character activates the cell so that we can type. It is
          // not included in the typed value.
          { value: `0${val}`, skipClear },
        ),
      );
    });
  });
  return tests;
}
