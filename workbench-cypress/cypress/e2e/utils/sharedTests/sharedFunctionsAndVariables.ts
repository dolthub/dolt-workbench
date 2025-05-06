import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newExpectationWithScrollIntoView,
  newExpectationWithTypeString,
  newShouldArgs,
} from "../helpers";
import { Expectation, Tests } from "../types";

export const beVisible = newShouldArgs("be.visible");
export const notBeVisible = newShouldArgs("not.be.visible");
export const notExist = newShouldArgs("not.exist");
export const exist = newShouldArgs("exist");
export const beVisibleAndContain = (value: string | string[]) =>
  newShouldArgs("be.visible.and.contain", value);
export const beChecked = newShouldArgs("be.checked");
export const notBeChecked = newShouldArgs("not.be.checked");
export const haveLength = (length: number) =>
  newShouldArgs("be.visible.and.have.length", length);
export const haveLengthAtLeast = (length: number) =>
  newShouldArgs("be.visible.and.have.length.of.at.least", length);

export const shouldFindAndCloseModal: Expectation =
  newExpectationWithClickFlows(
    "should find modal cancel button",
    `[data-cy=modal-buttons] button:first-of-type`,
    beVisibleAndContain("Cancel"),
    [newClickFlow(`[data-cy=modal-buttons] button:first-of-type`, [])],
  );

export const shouldFindAndScrollTo = (dataCy: string): Expectation =>
  newExpectationWithScrollIntoView(
    `should scroll to ${dataCy}`,
    `[data-cy=${dataCy}]`,
    beVisible,
    true,
  );

export const shouldFindAndScrollToWithText = (
  dataCy: string,
  text: string,
): Expectation =>
  newExpectationWithScrollIntoView(
    `should scroll to ${dataCy}`,
    `[data-cy=${dataCy}]`,
    beVisibleAndContain(text),
    true,
  );

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

export const shouldFindAndHaveValue = (
  dataCy: string,
  value: string | number | boolean,
  desc?: string,
): Expectation =>
  newExpectation(
    `should find ${desc ?? getDesc(dataCy)} with value "${value}"`,
    `[data-cy=${dataCy}]`,
    newShouldArgs("be.visible.and.have.value", value),
  );

export const shouldFindCheckbox = (
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

export const shouldFindButton = (
  dataCy: string,
  disabled = false,
): Expectation =>
  newExpectation(
    `should find${disabled ? "disabled" : "enabled"} ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    newShouldArgs(disabled ? "be.disabled" : "be.enabled"),
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

export const shouldNotExist = (dataCy: string): Expectation =>
  newExpectation(
    `should not find ${getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    notExist,
  );

export function shouldTypeAndSelectOption(
  optionToSelect: string,
  selectorDataCy: string,
  selectorIdx: number,
  optionIdx: number,
  typeString: string,
  skipClear = false,
): Expectation[] {
  return [
    newExpectationWithTypeString(
      `should search and select ${optionToSelect}`,
      `[data-cy=${selectorDataCy}] input`,
      beVisible,
      { value: typeString, skipClear },
    ),
    newExpectationWithClickFlows(
      `should have ${optionToSelect}`,
      `[id=react-select-${selectorIdx}-option-${optionIdx}]`,
      beVisibleAndContain(optionToSelect),
      [
        newClickFlow(
          `[id=react-select-${selectorIdx}-option-${optionIdx}]`,
          [],
        ),
      ],
    ),
  ];
}

export function shouldSelectOption(
  optionToSelect: string,
  selectorDataCy: string,
  selectorIdx: number,
  optionIdx: number,
  currentValue?: string,
): Expectation {
  return newExpectationWithClickFlows(
    `should select ${optionToSelect}`,
    `[data-cy=${selectorDataCy}]`,
    currentValue ? beVisibleAndContain(currentValue) : beVisible,
    [
      newClickFlow(
        `[data-cy=${selectorDataCy}]`,
        [
          newExpectation(
            `should have ${optionToSelect}`,
            `[id=react-select-${selectorIdx}-option-${optionIdx}]`,
            beVisibleAndContain(optionToSelect),
          ),
        ],
        `[id=react-select-${selectorIdx}-option-${optionIdx}]`,
      ),
    ],
  );
}

function getDesc(dataCy: string): string {
  return dataCy.replace(/-/g, " ");
}

export const shouldTypeString = (dataCy: string, value: string) =>
  newExpectationWithTypeString(
    `should type in ${getDesc(dataCy)} input`,
    `[data-cy=${dataCy}]`,
    beVisible,
    { value },
  );

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
