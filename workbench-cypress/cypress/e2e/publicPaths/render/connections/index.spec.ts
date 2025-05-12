import {
  shouldFindAndContain,
  shouldFindButton,
} from "@sharedTests/sharedFunctionsAndVariables";
import { newExpectation, newShouldArgs } from "@utils/helpers";
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
    newExpectation(
      "should find connections list with at least 1 connection",
      "[data-cy=connections-list] > li",
      newShouldArgs("be.visible.and.have.length.of.at.least", 1),
    ),
    shouldFindAndContain(
      "connection-workbench-cypress-test",
      "workbench-cypress-test",
    ),
  ];
  runTests({ tests, currentPage, pageName });
});
