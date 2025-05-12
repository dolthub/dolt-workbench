import { Tests } from "@utils/types";
import {
  shouldBeVisible,
  shouldClickAndFind,
  shouldFindAndContain,
  shouldFindButton,
  shouldFindCheckbox,
  shouldTypeString,
} from "./sharedFunctionsAndVariables";

const connectionUrl = Cypress.env("WORKBENCH_CONNECTION_URL");

const testAboutTab = (connectionName: string): Tests => [
  shouldFindAndContain("active-tab", "About"),
  shouldTypeString("connection-name-input", connectionName),
  shouldFindAndContain("connection-type-selector", "MySQL/Dolt"),
  shouldFindButton("next-about", false),
  shouldClickAndFind("next-about", "active-tab"),
];

const testConnectionTab = [
  shouldFindAndContain("active-tab", "Connection"),
  shouldTypeString("connection-url-input", "test-url"),
  shouldBeVisible("connection-host-input"),
  shouldBeVisible("connection-port-input"),
  shouldBeVisible("connection-user-input"),
  shouldBeVisible("connection-password-input"),
  shouldBeVisible("connection-database-input"),
  shouldFindButton(" next-connection", false),
  shouldClickAndFind("next-connection", "active-tab"),
];

const testAdvancedTab = [
  shouldFindAndContain("active-tab", "Advanced"),
  ...shouldFindCheckbox("use-ssl-checkbox", true),
  ...shouldFindCheckbox("hide-dolt-features-checkbox", false),
  shouldFindButton("launch-workbench-button", false),
];

export const addWorkbenchTestConnection = (connectionName: string): Tests => [
  ...testAboutTab(connectionName),
  ...testConnectionTab,
  ...testAdvancedTab,
];
