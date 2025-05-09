import { newExpectation, newExpectationWithTypeString } from "@utils/helpers";
import { ShouldArgs, Tests } from "@utils/types";
import {
  beVisible,
  newClickFlow,
  newExpectationWithClickFlows,
  shouldBeVisible,
} from "./sharedFunctionsAndVariables";

const connectionUrl = Cypress.env("WORKBENCH_CONNECTION_STRING");

export const addWorkbenchTestConnection = (connectionName: string): Tests => [
  shouldBeVisible("add-connection-form"),
  shouldBeVisible("connection-tabs-about"),

  newExpectationWithTypeString(
    "should input new connection name",
    "input[name=connection-name]",
    beVisible,
    { value: connectionName },
  ),

  newExpectationWithClickFlows(
    "should click next button",
    `[data-cy=about-next-button]`,
    beVisible,
    [
      newClickFlow(`[data-cy=about-next-button]`, [
        newExpectation(
          "should show connection form",
          `[data-cy=connection-tab-form]`,
          beVisible,
        ),
      ]),
    ],
  ),

  newExpectationWithTypeString(
    "should input connection url",
    "input[name=connection-url]",
    beVisible,
    { value: connectionUrl },
  ),

  newExpectationWithClickFlows(
    "should click next button",
    `[data-cy=connection-next-button]`,
    beVisible,
    [
      newClickFlow(`[data-cy=connection-next-button]`, [
        newExpectation(
          "should show connection form",
          `[data-cy=advanced-tab-form]`,
          beVisible,
        ),
      ]),
    ],
  ),

  newExpectationWithClickFlows(
    "should click launch workbench button",
    `[data-cy=launch-workbench-button]`,
    beVisible,
    [newClickFlow(`[data-cy=launch-workbench-button]`, [])],
  ),
];
