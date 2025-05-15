import {
  ClickFlow,
  Expectation,
  Selector,
  ShouldArgs,
  Tests,
  TypeStringType,
} from "./types";

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

export function newExpectationWithScrollIntoView(
  description: string,
  selector: Selector,
  shouldArgs: ShouldArgs,
  scrollIntoView: boolean,
  skip = false,
  timeout?: number,
): Expectation {
  return { description, selector, scrollIntoView, shouldArgs, skip, timeout };
}

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
