import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "./helpers";
import { beVisible } from "./sharedTests/sharedFunctionsAndVariables";

const sqlEditorClickFlow = newClickFlow(
  "[data-cy=sql-editor-collapsed]",
  [
    newExpectation(
      "table footer should be expanded after click",
      "[data-cy=sql-editor-expanded]",
      beVisible,
    ),
  ],
  "[data-cy=sql-editor-expanded]",
);

export const testSqlConsole = newExpectationWithClickFlows(
  "should find sql console initially closed, and then open on click",
  "[data-cy=sql-editor-collapsed",
  beVisible,
  [sqlEditorClickFlow],
);
