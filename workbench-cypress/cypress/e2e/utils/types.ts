// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ShouldArgs = { chainer: string; value?: any };

export type Selector = string | string[];
export type TypeStringType = {
  value: string;
  eq?: number;
  skipClear?: boolean;
};
export type ScrollToPosition = {
  position: Cypress.PositionType;
  selectorStr?: string;
  options?: Partial<Cypress.ScrollToOptions>;
};

export type ScrollToXY = {
  x: string | number;
  y: string | number;
  selectorStr?: string;
  options?: Partial<Cypress.ScrollToOptions>;
};

export type ScrollIntoView = {
  selectorStr: string;
  options?: Partial<Cypress.ScrollIntoViewOptions>;
};

export type ScrollTo = ScrollToPosition | ScrollToXY | ScrollIntoView;

export type ClickFlow = {
  toClickBefore?: Selector;
  expectations: Expectation[];
  toClickAfter?: Selector;
  force?: boolean;
};

export type Expectation = {
  description: string;
  selector: Selector;
  shouldArgs: ShouldArgs;
  clickFlows?: ClickFlow[] | undefined;
  scrollIntoView?: boolean;
  scrollTo?: ScrollTo;
  skip?: boolean;
  typeString?: TypeStringType;
  selectOption?: number;
  targetPage?: string;
  url?: string;
  timeout?: number;
};

export type Tests = Expectation[];
