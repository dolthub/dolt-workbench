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
const opts: Partial<Cypress.Timeoutable> = {
  timeout: defaultTimeout,
};
const clickOpts: Partial<Cypress.ClickOptions> = { scrollBehavior: false };
const connectionUrl = Cypress.env("WORKBENCH_CONNECTION_URL");

// Ensures page has loaded before running tests
// Reference: https://www.cypress.io/blog/2018/02/05/when-can-the-test-start/
Cypress.Commands.add("visitAndWait", (path: string) => {
  let appHasStarted = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function spyOnAddEventListener(win: any) {
    // win = window object in our application
    const addListener = win.EventTarget.prototype.addEventListener;
    win.EventTarget.prototype.addEventListener = function (name: string) {
      if (name === "change") {
        // web app added an event listener to the input box -
        // that means the web application has started
        appHasStarted = true;
        // restore the original event listener
        win.EventTarget.prototype.addEventListener = addListener;
      }
      return addListener.apply(this, arguments);
    };
  }

  function waitForAppStart() {
    // keeps rechecking "appHasStarted" variable
    return new Cypress.Promise((resolve, _) => {
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

Cypress.Commands.add("addConnection", (connectionName: string) => {
  cy.visitAndWait("/connections/new");
  addConnectionForCypressTesting(connectionName);
});

function addConnectionForCypressTesting(connectionName: string) {
  // About tab
  cy.get("[data-cy=active-tab]", opts).should(
    "be.visible.and.contain",
    "About",
  );
  // Enter connection name
  cy.get("[data-cy=connection-name-input]", opts)
    .should("be.visible")
    .type(connectionName, { ...clickOpts, log: false });
  cy.get("[data-cy=connection-name-input]").should(
    "have.value",
    connectionName,
  );
  // Check database type is MySQL/Dolt
  cy.get("[data-cy=connection-type-selector]", opts).should(
    "be.visible.and.contain",
    "MySQL/Dolt",
  );
  cy.get("[data-cy=next-about]", opts).should("be.enabled");
  cy.get("[data-cy=next-about]", opts).click(clickOpts);

  // Connection tab
  cy.get("[data-cy=active-tab]", opts).should(
    "be.visible.and.contain",
    "Connection",
  );
  // Enter connection url
  cy.get("[data-cy=connection-url-input]", opts)
    .should("be.visible")
    .type(connectionUrl, { ...clickOpts, log: false });
  cy.get("[data-cy=connection-url-input]").should("have.value", connectionUrl);
  cy.get("[data-cy=next-connection]", opts).should("be.enabled");
  cy.get("[data-cy=next-connection]", opts).click(clickOpts);

  // Launch database
  cy.get("[data-cy=active-tab]", opts).should(
    "be.visible.and.contain",
    "Advanced",
  );
  cy.get("[data-cy=launch-workbench-button]", opts).should("be.enabled");
  cy.get("[data-cy=launch-workbench-button]", opts).click(clickOpts);

  // Check successfully launched workbench
  cy.get("[data-cy=databases-list]", opts).should("be.visible");
}

Cypress.Commands.add("deleteTestConnection", (connectionName: string) => {
  cy.visitAndWait("/connections");
  cy.get(`[data-cy=delete-${connectionName}-button]`, opts).should(
    "be.enabled",
  );
  cy.get(`[data-cy=delete-${connectionName}-button]`, opts).click(clickOpts);
  cy.get("[data-cy=delete-connection-confirm-button]", opts).should(
    "be.enabled",
  );
  cy.get("[data-cy=delete-connection-confirm-button]", opts).click(clickOpts);
  cy.get("[data-cy=connection-CypressTestConnection]", opts).should(
    "not.exist",
  );
});
