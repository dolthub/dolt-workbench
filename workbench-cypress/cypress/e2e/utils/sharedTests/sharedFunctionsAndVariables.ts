import { newExpectation, newShouldArgs } from "../helpers";
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
