import {
  shouldFindAndContain,
  shouldFindButton,
} from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";

const pageName = "Homepage";
const currentPage = "/";

describe(pageName, () => {
  const tests = [
    shouldFindAndContain("connections-title", "Connections"),
    shouldFindAndContain(
      "welcome-message",
      "Connect the workbench to any MySQL or PostgreSQL compatible database. ",
    ),
    shouldFindButton("add-connection-button"),
    shouldFindAndContain(
      "connection-workbench-cypress-test",
      "workbench-cypress-test",
    ),
  ];
  runTests({ tests, currentPage, pageName });
});
