import { newExpectation, newShouldArgs } from "../helpers";
import { Expectation } from "../types";

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
