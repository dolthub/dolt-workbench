import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { newExpectation, newShouldArgs } from "@utils/helpers";

const pageName = "Tests page";
const connectionName = "CypressTestConnection";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/tests/main`;
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    // The page should show the tests interface
    newExpectation(
      "should show tests page title",
      "h1",
      newShouldArgs("contain.text", "Tests"),
    ),
    // Should show the tests list interface
    newExpectation(
      "should show tests interface",
      "[data-cy=tests-list]",
      newShouldArgs("be.visible"),
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
