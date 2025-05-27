import { newExpectation, newShouldArgs } from "@utils/helpers";
import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import {
  shouldFindAndContain,
  shouldNotExist,
} from "@utils/sharedTests/sharedFunctionsAndVariables";

const pageName = "Docs page";
const dbName = "us-jails";
const currentBranch = "main";
const currentPage = `/database/${dbName}/doc/${currentBranch}`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    shouldNotExist("no-docs-found"),
    shouldNotExist("add-docs-instructions"),
    newExpectation(
      "should find docs list",
      "[data-cy=db-docs-list] > li",
      newShouldArgs("be.visible.and.have.length", 2),
    ),
    shouldFindAndContain(
      "db-doc-markdown",
      "README.md",
      "should find doc markdown",
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
