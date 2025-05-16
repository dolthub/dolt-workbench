import {
  beVisible,
  haveLengthAtLeast,
  shouldBeVisible,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { newExpectation } from "@utils/helpers";
import { runTests } from "@utils/index";
import { changeBranch } from "@utils/sharedTests/changeBranch";

const pageName = "Pull requests page";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const pullsPage = `/database/${dbName}/pulls`;
const currentPage = `${pullsPage}?filter=all`;
const destinationBranch = "delete-rows";

const hasDocs = true;

describe(pageName, () => {
  const changeBranchParams = {
    isLeftNavClosed: true,
    currentTabDataCy: "pull-requests-table",
    destinationBranch,
    destinationURL: `/${pullsPage}?refName=${destinationBranch}`,
  };

  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...changeBranch(changeBranchParams),
    shouldNotExist("pull-requests-no-pulls"),
    shouldBeVisible("pull-search-input"),
    newExpectation(
      "should find at least 1 pull",
      "[data-cy=pull-requests-table] > li",
      haveLengthAtLeast(1),
    ),
    newExpectation(
      "should find pull with ID 1 with pull state icon",
      "[data-cy=pull-requests-row-1] [data-cy=pull-state-icon]",
      beVisible,
    ),
    newExpectation(
      "should find pull with ID 1 with pull title",
      "[data-cy=pull-requests-row-1] [data-cy=pull-title]",
      beVisible,
    ),
    newExpectation(
      "should find pull with ID 1 with pull id",
      "[data-cy=pull-requests-row-1] [data-cy=pull-id]",
      beVisible,
    ),
    newExpectation(
      "should find pull with ID 1 with pull creator",
      "[data-cy=pull-requests-row-1] [data-cy=pull-creator]",
      beVisible,
    ),
    newExpectation(
      "should find pull with ID 1 with created time",
      "[data-cy=pull-requests-row-1] [data-cy=created-time]",
      beVisible,
    ),
    newExpectation(
      "should find pull with ID 1 with comment count",
      "[data-cy=pull-requests-row-1] [data-cy=comment-count]",
      beVisible,
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
