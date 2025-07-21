import { newExpectation } from "@utils/helpers";
import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import {
  notExist,
  shouldBeVisible,
  shouldNotExist,
} from "@utils/sharedTests/sharedFunctionsAndVariables";

const pageName = "ER Diagram";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/schema/main`;
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    newExpectation(
      "should not find empty database",
      "[data-cy=db-data-table-empty]",
      notExist,
    ),
    shouldNotExist("db-doc-markdown"),
    ...testDBHeader(connectionName, dbName, hasDocs),
    shouldBeVisible("er-diagram-canvas"),
    shouldBeVisible("er-diagram-close-control-button"),
    shouldBeVisible("er-diagram-notation"),
  ];
  runTests({ tests, currentPage, pageName });
});
