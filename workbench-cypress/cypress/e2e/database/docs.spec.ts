import { testDBHeader } from "@utils/dbHeaders";
import { newExpectation, newShouldArgs } from "@utils/helpers";
import { runTests } from "@utils/index";

const pageName = "Docs page";
const dbName = "us-jails";
const currentBranch = "main";
const currentPage = `/database/${dbName}/doc/${currentBranch}`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const notExist = newShouldArgs("not.exist");

  const commonTests = [
    newExpectation(
      "should not have no docs header",
      "[data-cy=no-docs-found]",
      notExist,
    ),
    newExpectation(
      "should not have instructions to add a doc",
      "[data-cy=add-docs-instructions]",
      notExist,
    ),
    newExpectation(
      "should find docs list",
      "[data-cy=db-docs-list] > li",
      newShouldArgs("be.visible.and.have.length", 2),
    ),
    newExpectation(
      "should find doc markdown",
      "[data-cy=db-doc-markdown]",
      newShouldArgs("be.visible.and.contain", "README.md"),
    ),
  ];

  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...commonTests,
  ];

  runTests({ tests, currentPage, pageName });
});
