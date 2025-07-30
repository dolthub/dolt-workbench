import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import {
  tableExpectations,
  testSchemaSection,
  testViewsSection,
} from "@utils/sharedTests/dbLeftNav";
import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import { runTests } from "@utils/index";
import {
  beVisible,
  notExist, shouldFindAndContain,
  shouldNotExist,
  shouldTypeString,
} from "@utils/sharedTests/sharedFunctionsAndVariables";
import { testSqlConsole } from "@utils/sharedTests/sqlEditor";

const pageName = "Database";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const currentPage = `/database/${dbName}`;

const hasBranch = true;
const testTable = "incidents";
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    newExpectation(
      "should not find empty database",
      "[data-cy=db-data-table-empty]",
      notExist,
    ),
    newExpectationWithClickFlows(
      "should show cell editor",
      "[data-cy=desktop-db-data-table-row-0-col-0]",
      beVisible,
      [
        newClickFlow(
          "[data-cy=desktop-db-data-table-row-0-col-0-dropdown]",
          [
            shouldFindAndContain(
              "desktop-db-data-table-row-0-col-0-dropdown-edit",
              "Edit Cell Value"
            )
          ],
          undefined,
          true
        ),
        newClickFlow(
          "[data-cy=desktop-db-data-table-row-0-col-0-dropdown-edit]",
          [
            shouldTypeString(
              "desktop-db-data-table-row-0-col-0-edit-input-value",
               "testEditCellValue"
            )
          ],
          "[data-cy=desktop-db-data-table-row-0-col-0-edit-input-cancel]",
        )
      ]
    ),
    shouldNotExist("db-doc-markdown"),
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...tableExpectations(false, true, 3, testTable),
    testViewsSection(hasBranch, 0),
    newExpectationWithClickFlows(
      "should show create view button",
      "[data-cy=create-view-button]",
      beVisible,
      [
        newClickFlow(
          "[data-cy=create-view-button]",
          [shouldTypeString("query-name", "testQueryName")],
          "[data-cy=close-modal]",
        ),
      ],
    ),
    testSchemaSection(hasBranch, 3, testTable),
    testSqlConsole,
  ];
  runTests({ tests, currentPage, pageName });
});
