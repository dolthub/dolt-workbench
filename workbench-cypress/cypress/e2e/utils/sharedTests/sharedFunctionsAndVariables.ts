import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newExpectationWithTypeString,
  newShouldArgs,
} from "../helpers";
import { Expectation } from "../types";

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
    newShouldArgs(disabled ? "be.disabled" : "be.enabled"),
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
