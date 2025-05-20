import { shouldBeVisible } from "@sharedTests/sharedFunctionsAndVariables";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { runTests } from "@utils/index";
import { selectBranch } from "@utils/sharedTests/changeBranch";

const pageName = "Merged pull page";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const baseBranch = "main";
const fromBranch = "delete-rows";
const currentPage = `database/${dbName}/pulls?refName=${baseBranch}`;

const hasDocs = true;

describe(pageName, () => {
  const changeFromBranchParams = {
    branchSelectorDataCy: "from-branch-selector",
    destinationBranch: fromBranch,
  };

  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...selectBranch(changeFromBranchParams),
    shouldBeVisible("delete-branch-button"),
  ];

  runTests({ tests, currentPage, pageName });
});
