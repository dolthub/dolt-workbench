import { Expectation, Selector, ShouldArgs, TypeStringType } from "./types";

// Expectations

export function newExpectation(
  description: string,
  selector: Selector,
  shouldArgs: ShouldArgs,
  skip = false,
): Expectation {
  return { description, selector, shouldArgs, skip };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newShouldArgs(chainer: string, value?: any): ShouldArgs {
  return { chainer, value };
}

export function newExpectationWithTypeString(
  description: string,
  selector: Selector,
  shouldArgs: ShouldArgs,
  typeString: TypeStringType,
  skip = false,
): Expectation {
  return { description, selector, shouldArgs, typeString, skip };
}
