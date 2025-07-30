import { runTests } from "@utils/index";
import { testDBHeader } from "@sharedTests/dbHeaders";
import { formatDataCy, newClickFlow, newExpectationWithClickFlows } from "@utils/helpers";
import { beVisibleAndContain, shouldFindAndContain } from "@sharedTests/sharedFunctionsAndVariables";

const pageName = "Commit graph page";
const dbName = "us-jails";
const currentBranch = "main";
const currentPage = `/database/${dbName}/commits/${currentBranch}`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    newExpectationWithClickFlows(
      "should open commit graph page",
      formatDataCy("commit-graph-button"),
      beVisibleAndContain("Show Commit Graph"),
      [newClickFlow(
        formatDataCy("commit-graph-button"),
        [shouldFindAndContain("commit-graph", "Commit Graph")]
      )]
    ),
    ...testDBHeader(connectionName, dbName, hasDocs)
  ];

  runTests({ tests, currentPage, pageName });
});
