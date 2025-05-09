import { Tests } from "@utils/types";
import {
  shouldClickAndFind,
  shouldFindAndContain,
  shouldFindButton,
  shouldTypeString,
} from "./sharedFunctionsAndVariables";

const connectionUrl = Cypress.env("WORKBENCH_CONNECTION_STRING");

const testAboutTab = (connectionName: string): Tests => [
  shouldFindAndContain("active-tab", "About"),
  shouldTypeString("connection-name-input", connectionName),
  shouldFindButton("next-about", false),
  shouldClickAndFind("next-about", "active-tab"),
];

const testConnectionTab = [
  shouldFindAndContain("active-tab", "Connection"),
  shouldTypeString("connection-url-input", connectionUrl),
  shouldFindButton(" next-connection false", false),
  shouldClickAndFind("next-about", "active-tab"),
];

export const addWorkbenchTestConnection = (connectionName: string): Tests => [
  ...testAboutTab(connectionName),
  ...testConnectionTab,
];
