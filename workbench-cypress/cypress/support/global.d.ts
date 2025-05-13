// in cypress/support/types.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;

    visitPage(currentPage: string): void;

    visitAndWait(path: string): void;

    addConnection(connectionName: string): void;

    deleteTestConnection(connectionName: string): void;
  }
}
