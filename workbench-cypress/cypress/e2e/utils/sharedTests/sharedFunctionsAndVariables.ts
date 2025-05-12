import {
  newExpectation,
  newExpectationWithTypeString,
  newShouldArgs,
} from "../helpers";
import { ClickFlow, Expectation, Selector, ShouldArgs, Tests } from "../types";

export const beVisibleAndContain = (value: string | string[]) =>
  newShouldArgs("be.visible.and.contain", value);

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

function getDesc(dataCy: string): string {
  return dataCy.replace(/-/g, " ");
}

export const beVisible = newShouldArgs("be.visible");

export const shouldBeVisible = (dataCy: string, desc?: string): Expectation =>
  newExpectation(
    `should find ${desc ?? getDesc(dataCy)}`,
    `[data-cy=${dataCy}]`,
    beVisible,
  );

// Click flows

export function newClickFlow(
  toClickBefore: Selector,
  expectations: Tests,
  toClickAfter?: Selector,
  force = false,
): ClickFlow {
  return {
    toClickBefore,
    expectations,
    toClickAfter,
    force,
  };
}

export function newExpectationWithClickFlows(
  description: string,
  selector: string,
  shouldArgs: ShouldArgs,
  clickFlows: ClickFlow[],
  skip = false,
): Expectation {
  return { description, selector, shouldArgs, clickFlows, skip };
}

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
