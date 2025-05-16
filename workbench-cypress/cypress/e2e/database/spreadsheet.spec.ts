import { newClickFlow, newExpectationWithClickFlows } from "@utils/helpers";
import { runTests } from "@utils/index";
import {
  beVisible,
  beVisibleAndContain,
  checkValueInGridTests,
  getTypeInGridTests,
  shouldBeVisible,
  shouldFindAndContain,
} from "@utils/sharedTests/sharedFunctionsAndVariables";

const pageName = "Edit table with spreadsheet editor";
const dbName = "us-jails";
const currentPage = `/database/${dbName}`;
const tableToEdit = "incidents";

const newRows = [
  ["100", "2020-03-09", "2020-03-10", "10", "300", "0"],
  ["101", "2020-03-10", "2020-03-11", "0", "3", "0"],
];

describe(`${pageName} renders expected components on different devices`, () => {
  const tests = [
    newExpectationWithClickFlows(
      "should show edit table button",
      `[data-cy=db-tables-table-${tableToEdit}-edit]`,
      beVisible,
      [
        newClickFlow(`[data-cy=db-tables-table-${tableToEdit}-edit]`, [
          shouldFindAndContain("sql-query-edit-button", "SQL Query"),
          shouldFindAndContain("file-upload-edit-button", "File Upload"),
        ]),
      ],
    ),
    newExpectationWithClickFlows(
      `should show and click spreadsheet editor`,
      `[data-cy=spreadsheet-edit-button]`,
      beVisibleAndContain("Spreadsheet Editor"),
      [
        newClickFlow("[data-cy=spreadsheet-edit-button]", [
          shouldFindAndContain(
            "spreadsheet-editor-title",
            "Spreadsheet Editor",
          ),
          shouldBeVisible("ignore-radio"),
          shouldBeVisible("replace-radio"),
        ]),
      ],
    ),

    // First row has pre-populated column names
    ...getTypeInGridTests([[], ...newRows], true),

    // click the editor title to lose focus in the last cell
    newExpectationWithClickFlows(
      "should show Create a new table",
      "[data-cy=spreadsheet-editor-title]",
      beVisible,
      [newClickFlow("[data-cy=spreadsheet-editor-title]", [])],
    ),

    ...checkValueInGridTests([
      ["id", "start_date", "end_date", "deaths", "fights", "total_assaults"],
      ...newRows,
    ]),
    shouldFindAndContain("upload-table-button", "Upload table"),
  ];

  runTests({ tests, currentPage, pageName });
});
