import {
  beVisible,
  shouldBeVisible,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";
import { newExpectation } from "@utils/helpers";
import { runTests } from "@utils/index";
import { changeBranch } from "@utils/sharedTests/changeBranch";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";

const pageName = "Pull requests page with open pulls";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/pulls`;

const destinationBranch = "delete-rows";
const changeBranchParams = {
  isLeftNavClosed: true,
  currentTabDataCy: "pull-requests-table",
  destinationBranch,
  destinationURL: `/${currentPage}?refName=${destinationBranch}`,
};

const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...changeBranch(changeBranchParams),
    shouldNotExist("pull-requests-no-pulls"),
    shouldBeVisible("pull-search-input"),
    newExpectation(
      "should find pull with ID 1 with pull state icon",
      "[data-cy=pull-requests-row-1] [data-cy=pull-state-icon]",
      beVisible,
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
