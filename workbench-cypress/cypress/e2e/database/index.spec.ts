import { testDBHeader } from "@utils/dbHeaders";
import {
  tableExpectations,
  testSchemaSection,
  testViewsSection,
} from "@utils/dbLeftNav";
import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import { runTests } from "@utils/index";
import {
  beVisible,
  notExist,
  shouldNotExist,
  shouldTypeString,
} from "@utils/sharedTests/sharedFunctionsAndVariables";
import { testSqlConsole } from "@utils/sqlEditor";

const pageName = "Database";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const currentPage = `/database/${dbName}`;

const hasBranch = true;
const testTable = "incidents";
const hasDocs = true;

describe(pageName, () => {
  const commonTests = [
    newExpectation(
      "should not find empty database",
      "[data-cy=db-data-table-empty]",
      notExist,
    ),
  ];

  const tests = [
    ...commonTests,
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
