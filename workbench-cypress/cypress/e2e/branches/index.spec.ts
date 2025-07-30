import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import {
  formatDataCy,
  newClickFlow,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import {
  beVisible,
  shouldFindAndContain,
} from "@sharedTests/sharedFunctionsAndVariables";

const pageName = "Branches page";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/branches`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

const showDeleteBranchPopUpTest = (branchToClick: string) =>
  newExpectationWithClickFlows(
    "should show delete branch popup",
    formatDataCy("branch-list"),
    beVisible,
    [
      newClickFlow(
        formatDataCy(`${branchToClick}-delete-button`),
        [shouldFindAndContain("modal-buttons", "Delete")],
        formatDataCy("close-modal"),
      ),
    ],
  );

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    showDeleteBranchPopUpTest("add-view"),
  ];

  runTests({ tests, currentPage, pageName });
});
