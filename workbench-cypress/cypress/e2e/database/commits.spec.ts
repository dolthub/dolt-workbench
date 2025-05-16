import { testDBHeader } from "@utils/dbHeaders";
import { newExpectation, newShouldArgs } from "@utils/helpers";
import { runTests } from "@utils/index";
import {
  beVisible,
  notExist,
} from "@utils/sharedTests/sharedFunctionsAndVariables";

const pageName = "Commit log page";
const dbName = "us-jails";
const currentBranch = "main";
const currentPage = `/database/${dbName}/commits/${currentBranch}`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const commonTests = [
    newExpectation(
      "should not find empty commits message",
      "[data-cy=commit-log-no-commits]",
      notExist,
    ),
    newExpectation(
      "should find commits list with at least 3 commits",
      "[data-cy=commit-log-commits-list] > li",
      newShouldArgs("be.visible.and.have.length.of.at.least", 3),
    ),
    newExpectation(
      "should find first commit date",
      "[data-cy=commit-log-item-date]:first",
      beVisible,
    ),
  ];

  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...commonTests,
    newExpectation(
      "should find first commit commit links",
      "[data-cy=commit-log-item]:first a",
      newShouldArgs("be.visible.and.have.length", 2),
    ),
    newExpectation(
      "should find first commit commit ID",
      "[data-cy=commit-log-id-desktop]:first",
      beVisible,
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
