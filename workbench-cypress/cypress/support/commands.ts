// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export const defaultTimeout = 10000;

// Ensures page has loaded before running tests
// Reference: https://www.cypress.io/blog/2018/02/05/when-can-the-test-start/
Cypress.Commands.add("visitAndWait", (path: string) => {
  let appHasStarted = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function spyOnAddEventListener(win: any) {
    // win = window object in our application
    const addListener = win.EventTarget.prototype.addEventListener;
    // eslint-disable-next-line no-param-reassign
    win.EventTarget.prototype.addEventListener = function (name: string) {
      if (name === "change") {
        // web app added an event listener to the input box -
        // that means the web application has started
        appHasStarted = true;
        // restore the original event listener
        // eslint-disable-next-line no-param-reassign
        win.EventTarget.prototype.addEventListener = addListener;
      }
      // eslint-disable-next-line prefer-rest-params
      return addListener.apply(this, arguments);
    };
  }

  function waitForAppStart() {
    // keeps rechecking "appHasStarted" variable
    return new Cypress.Promise((resolve, _) => {
      // eslint-disable-next-line consistent-return
      const isReady = () => {
        if (appHasStarted) {
          return resolve();
        }
        setTimeout(isReady, 0);
      };
      isReady();
    });
  }

  cy.visit(path, {
    onBeforeLoad: spyOnAddEventListener,
    failOnStatusCode: false,
  }).then(waitForAppStart);
});

Cypress.Commands.add("visitPage", (currentPage: string) => {
  // 404 page should be rendered when page not found
  cy.visitAndWait(currentPage);
});

Cypress.on(
  "uncaught:exception",
  err => !err.message.includes("ResizeObserver loop limit exceeded"),
);
