import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import {
  formatDataCy,
  newClickFlow,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import {
  beDisabled,
  beVisible,
  beVisibleAndContain,
  shouldBeVisible,
  shouldFindAndContain,
  shouldFindButton,
  shouldTypeString,
} from "@sharedTests/sharedFunctionsAndVariables";
import { Expectation } from "@utils/types";

const pageName = "Branches page";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/branches`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

const createBranchTest = (fromBranch: string) =>
  newExpectationWithClickFlows(
    "should go to create branch page",
    formatDataCy("create-branch-page-button"),
    beVisibleAndContain("Create Branch"),
    [
      newClickFlow(
        formatDataCy("create-branch-page-button"),
        [
          newExpectationWithClickFlows(
            "should fill out create branch form",
            formatDataCy("create-branch-button"),
            beDisabled,
            [
              newClickFlow(formatDataCy("branch-and-commit-selector"), [
                shouldFindAndContain(`select-option-${fromBranch}`, fromBranch),
              ]),
              newClickFlow(formatDataCy(`select-option-${fromBranch}`), [
                shouldBeVisible(`single-value-${fromBranch}`),
              ]),
              newClickFlow(formatDataCy("new-branch-name-input"), [
                shouldTypeString("new-branch-name-input", "test-new-branch"),
                shouldFindButton("create-branch-button"),
              ]),
            ],
          ),
        ],
        formatDataCy("cancel-button"),
      ),
    ],
  );

const showDeleteBranchPopUpTest = (branchToClick: string): Expectation =>
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
    createBranchTest("main"),
    showDeleteBranchPopUpTest("add-view"),
  ];

  runTests({ tests, currentPage, pageName });
});
