import {
  haveLengthAtLeast,
  shouldBeVisible,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";
import { newExpectation } from "@utils/helpers";
import { runTests } from "@utils/index";
import { selectBranch } from "@utils/sharedTests/changeBranch";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";

const pageName = "Pull requests page with open pulls";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const baseBranch = "main";
const fromBranch = "add-view";
const currentPage = `database/${dbName}/pulls?refName=${baseBranch}`;

const changeFromBranchParams = {
  branchSelectorDataCy: "from-branch-selector",
  destinationBranch: fromBranch,
};

const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...selectBranch(changeFromBranchParams),
    shouldNotExist("pull-requests-no-pulls"),
    shouldBeVisible("pull-details-list"),
    newExpectation(
      "should find at least 1 commit",
      "[data-cy=pull-details-list] > li",
      haveLengthAtLeast(1),
    ),
    shouldBeVisible("merge-button"),
    shouldBeVisible("add-author-checkbox"),
  ];

  runTests({ tests, currentPage, pageName });
});
