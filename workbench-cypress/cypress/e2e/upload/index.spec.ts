import { runTests } from "@utils/index";
import {
  beDisabled,
  beVisible,
  shouldFindAndContain,
  shouldFindButton,
} from "@sharedTests/sharedFunctionsAndVariables";
import {
  formatDataCy,
  newClickFlow,
  newExpectationWithClickFlows,
} from "@utils/helpers";

const pageName = "Upload file page";

const dbName = "us-jails";
const currentPage = `/database/${dbName}/upload`;
const tableName = "incidents";

const chooseBranchForFileUploadTest = newExpectationWithClickFlows(
  "should choose branch for file upload",
  formatDataCy("upload-choose-branch"),
  beVisible,
  [
    newClickFlow(
      formatDataCy("single-value-main"),
      [shouldFindAndContain("select-option-main", "main")],
      undefined,
      true,
    ),
    newClickFlow(formatDataCy("select-option-main"), [
      shouldFindButton("upload-next-button", false),
    ]),
    newClickFlow(formatDataCy("upload-next-button"), [
      shouldFindAndContain("table-title", "Choose a table name"),
    ]),
  ],
);

const chooseTableForFileUploadTest = newExpectationWithClickFlows(
  "should choose table name for file upload",
  formatDataCy("upload-next-button"),
  beDisabled,
  [
    newClickFlow(formatDataCy("table-selector"), [
      shouldFindAndContain(`select-option-${tableName}`, "incidents"),
    ]),
    newClickFlow(formatDataCy(`select-option-${tableName}`), [
      shouldFindButton("upload-next-button", false),
    ]),
    newClickFlow(formatDataCy("upload-next-button"), [
      shouldFindAndContain("upload-title", "Upload file"),
    ]),
  ],
);

describe(pageName, () => {
  const tests = [chooseBranchForFileUploadTest, chooseTableForFileUploadTest];
  runTests({ tests, currentPage, pageName });
});
