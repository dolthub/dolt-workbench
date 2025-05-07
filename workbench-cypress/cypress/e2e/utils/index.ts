import {
  ClickFlow,
  Expectation,
  ScrollTo,
  ShouldArgs,
  Tests,
  TypeStringType,
} from "./types";

// defaultTimeout is the time in ms cypress will wait attempting
// to .get() an element before failing
export const defaultTimeout = 5000;
export const opts: Partial<Cypress.Timeoutable> = {
  timeout: defaultTimeout,
};
export const getOpts = (
  timeout = defaultTimeout,
): Partial<Cypress.Timeoutable> => ({
  timeout,
});
export const clickOpts: Partial<Cypress.ClickOptions> = {
  scrollBehavior: false,
};

// RUN TESTS

type TestsArgs = {
  tests: Tests;
  currentPage: string;
  pageName: string;
};

export function runTests({ tests, currentPage, pageName }: TestsArgs) {
  before(() => {
    // Visit page
    cy.visitPage(currentPage);
    cy.screenshot("visitPage");
  });

  it(`run tests for ${pageName}`, () => {
    tests.forEach(t => {
      cy.log(t.description);
      cy.screenshot();
      if (t.skip) return;

      testAssertion(t);

      if (t.clickFlows) {
        testClickFlows({
          clickFlows: t.clickFlows,
          description: t.description,
          timeout: t.timeout,
        });
      }

      if (t.scrollTo) {
        handleScrollTo(t.scrollTo);
      }
    });
  });
}

// HELPER FUNCTIONS

function testAssertion(t: Expectation) {
  if (Array.isArray(t.selector)) {
    return t.selector.forEach(s =>
      getAssertionTest(
        t.description,
        s,
        t.shouldArgs,
        t.typeString,
        t.selectOption,
        t.targetPage,
        t.url,
        t.scrollIntoView,
        t.timeout,
      ),
    );
  }
  return getAssertionTest(
    t.description,
    t.selector,
    t.shouldArgs,
    t.typeString,
    t.selectOption,
    t.targetPage,
    t.url,
    t.scrollIntoView,
    t.timeout,
  );
}

function getAssertionTest(
  description: string,
  selectorStr: string,
  shouldArgs: ShouldArgs,
  typeString?: TypeStringType,
  selectOption?: number,
  targetPage?: string,
  url?: string,
  scrollIntoView?: boolean,
  timeout?: number,
) {
  const message = `
  Test assertion failed... 
  related test: ${description},
  related selector: ${selectorStr},
`;

  const o = getOpts(timeout);
  if (typeString) {
    if (typeString.eq) {
      return cy
        .get(selectorStr, o)
        .eq(typeString.eq)
        .type(typeString.value, clickOpts);
    }
    if (!typeString.skipClear) {
      cy.get(selectorStr, o).clear(clickOpts);
      return cy.get(selectorStr, o).type(typeString.value, clickOpts);
    }
    return cy.get(selectorStr, o).type(typeString.value, clickOpts);
  }
  if (selectOption !== undefined) {
    cy.get(selectorStr).eq(selectOption).click();
  }
  if (targetPage) {
    cy.visitPage(targetPage);
  }
  if (url) {
    const base = Cypress.config().baseUrl;
    cy.location("href", o).should("eq", `${base}${url}`);
  }
  if (scrollIntoView) {
    scrollSelectorIntoView(selectorStr, timeout);
  }
  if (Array.isArray(shouldArgs.value)) {
    if (shouldArgs.chainer !== "be.visible.and.contain") {
      throw new Error(
        "Value array can only be used with be.visible.and.contain",
      );
    }
    return cy
      .get(selectorStr, o)
      .should("be.visible")
      .should($el => {
        shouldArgs.value.forEach((v: string) => {
          expect($el).to.contain(v, message);
        });
      });
  }

  return cy
    .get(selectorStr, o)
    .should(shouldArgs.chainer, shouldArgs.value, { message });
}

type ClickFlowsArgs = {
  description: string;
  clickFlows?: ClickFlow[];
  timeout?: number;
};

// testClickFlows recursively runs clickFlow tests
// clicking each toClickBefore first, then making assertions
// the clicking each toClickAfter
export function testClickFlows({
  description,
  clickFlows,
  timeout,
}: ClickFlowsArgs) {
  if (!clickFlows) return;
  cy.log(description);

  clickFlows.forEach(({ toClickBefore, expectations, toClickAfter, force }) => {
    if (toClickBefore) runClicks(toClickBefore, force, timeout);

    expectations.forEach(t => {
      testAssertion(t);
      testClickFlows({
        description,
        clickFlows: t.clickFlows,
        timeout: t.timeout,
      });
    });

    if (toClickAfter) runClicks(toClickAfter, false, timeout);
  });
}

// runClicks clicks on each selectorStr
function runClicks(
  clickStrOrArr: string | string[],
  force?: boolean,
  timeout?: number,
) {
  const cOpts = { ...clickOpts, force };
  const o = getOpts(timeout);
  if (Array.isArray(clickStrOrArr)) {
    clickStrOrArr.forEach(clickStr => {
      cy.get(clickStr, o).click(cOpts);
    });
  } else {
    cy.get(clickStrOrArr, o).click(cOpts);
  }
}

// scrollSelectorIntoView scrolls the selector into view
function scrollSelectorIntoView(
  clickStrOrArr: string | string[],
  timeout?: number,
) {
  const o = getOpts(timeout);
  if (Array.isArray(clickStrOrArr)) {
    clickStrOrArr.forEach(clickStr => {
      cy.get(clickStr, o).scrollIntoView();
    });
  } else {
    cy.get(clickStrOrArr, o).scrollIntoView();
  }
}

// handleScrollTo scrolls to the given selector string and the designated position
function handleScrollTo(scrollTo: ScrollTo) {
  if ("position" in scrollTo) {
    if (scrollTo.selectorStr) {
      return cy
        .get(scrollTo.selectorStr)
        .scrollTo(scrollTo.position, scrollTo.options);
    }
    return cy.scrollTo(scrollTo.position, scrollTo.options);
  }

  if ("x" in scrollTo && "y" in scrollTo) {
    if (scrollTo.selectorStr) {
      return cy
        .get(scrollTo.selectorStr)
        .scrollTo(scrollTo.x, scrollTo.y, scrollTo.options);
    }
    return cy.scrollTo(scrollTo.x, scrollTo.y, scrollTo.options);
  }

  if ("selectorStr" in scrollTo) {
    return cy.get(scrollTo.selectorStr).scrollIntoView(scrollTo.options);
  }
  throw new Error(`invalid scrollTo type: ${scrollTo}`);
}
