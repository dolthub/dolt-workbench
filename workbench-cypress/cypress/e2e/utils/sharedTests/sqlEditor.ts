import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newShouldArgs,
} from "../helpers";

const shouldArgs = newShouldArgs("be.visible");

const sqlEditorClickFlow = newClickFlow(
  "[data-cy=sql-editor-collapsed]",
  [
    newExpectation(
      "table footer should be expanded after click",
      "[data-cy=sql-editor-expanded]",
      shouldArgs,
    ),
  ],
  "[data-cy=sql-editor-expanded]",
);

const sqlEditorClickFlowMobile = newClickFlow(
  "[data-cy=mobile-sql-editor-button]",
  [
    newExpectation(
      "should show mobile sql editor",
      "[data-cy=mobile-sql-editor]",
      shouldArgs,
    ),
    newExpectation(
      "should show run query button",
      "[data-cy=mobile-run-query-button]",
      shouldArgs,
    ),
  ],
  "[data-cy=mobile-close-query-editor-button]",
);

export const testSqlConsole = newExpectationWithClickFlows(
  "should find sql console initially closed, and then open on click",
  "[data-cy=sql-editor-collapsed",
  shouldArgs,
  [sqlEditorClickFlow],
);

export const testSqlConsoleMobile = newExpectationWithClickFlows(
  "should find sql console initially closed, and then open on click",
  "[data-cy=mobile-sql-editor-button",
  shouldArgs,
  [sqlEditorClickFlowMobile],
);
