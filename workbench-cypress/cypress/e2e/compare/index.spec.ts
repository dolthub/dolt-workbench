import { runTests } from "@utils/index";
import { testDBHeader } from "@sharedTests/dbHeaders";
import { Expectation } from "@utils/types";
import {
  formatDataCy,
  newClickFlow,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import {
  beVisible,
  shouldFindAndContain,
  shouldNotBeVisible,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";

const pageName = "Branch diff page";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/compare`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

const diffTest = (
  toRef: string,
  fromRef: string,
  expectedDiffStat: string,
): Expectation =>
  newExpectationWithClickFlows(
    "should show diff between two refs",
    formatDataCy("diff-selector"),
    beVisible,
    [
      newClickFlow(formatDataCy("to-ref-selector"), [
        shouldFindAndContain(`select-option-${toRef}`, toRef),
      ]),
      newClickFlow(formatDataCy(`select-option-${toRef}`), [
        shouldNotExist(`select-option-${toRef}`),
      ]),
      newClickFlow(formatDataCy("from-ref-selector"), [
        shouldFindAndContain(`select-option-${fromRef}`, fromRef),
      ]),
      newClickFlow(formatDataCy(`select-option-${fromRef}`), [
        shouldNotExist(`select-option-${fromRef}`),
      ]),
      newClickFlow(formatDataCy("view-diff-button"), [
        shouldFindAndContain("diff-table-stats", expectedDiffStat),
      ]),
    ],
  );

const branchDiffTest = diffTest("main", "add-view", "1 Row Deleted");

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    branchDiffTest,
  ];

  runTests({ tests, currentPage, pageName });
});
