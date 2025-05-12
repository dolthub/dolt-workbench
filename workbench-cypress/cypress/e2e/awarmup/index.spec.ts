import { runTests } from "@utils/index";
import {
  shouldBeVisible,
  shouldClickAndFind,
  shouldFindAndContain,
  shouldFindButton,
  shouldFindCheckbox,
  shouldTypeString,
} from "@utils/sharedTests/sharedFunctionsAndVariables";
import { Tests } from "@utils/types";

// This should be the first test to set up the connection

const pageName = "New Connection";
const currentPage = "/connections/new";
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
  shouldTypeString("connection-url-input", connectionUrl),
  shouldBeVisible("connection-host-input"),
  shouldBeVisible("connection-port-input"),
  shouldBeVisible("connection-user-input"),
  shouldBeVisible("connection-password-input"),
  shouldBeVisible("connection-database-input"),
  shouldFindButton("next-connection", false),
  shouldClickAndFind("next-connection", "active-tab"),
];

const testAdvancedTab = [
  shouldFindAndContain("active-tab", "Advanced"),
  ...shouldFindCheckbox("use-ssl-checkbox", true),
  ...shouldFindCheckbox("hide-dolt-features-checkbox", false),
  shouldFindButton("launch-workbench-button", false),
  shouldClickAndFind("launch-workbench-button", "database-test-button"),
];

describe(`${pageName} renders expected components`, () => {
  const tests = [
    ...testAboutTab("workbench-cypress-test"),
    ...testConnectionTab,
    ...testAdvancedTab,
  ];
  runTests({ tests, currentPage, pageName });
});
