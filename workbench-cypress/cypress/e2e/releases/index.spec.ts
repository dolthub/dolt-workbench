import { newExpectation, newShouldArgs } from "@utils/helpers";
import { runTests } from "@utils/index";
import { testDBHeader } from "@sharedTests/dbHeaders";
import {
  beVisible,
  shouldBeVisible,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";

const pageName = "Releases page";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/releases`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    shouldNotExist("release-list-no-releases"),
    newExpectation(
      "should have at least one tag",
      "[data-cy=release-list-item]",
      newShouldArgs("be.visible.and.have.length.of.at.least", 1),
    ),
    shouldBeVisible("release-list-header", "should have release header"),
    shouldBeVisible(
      "release-list-latest-label",
      "should find latest release label",
    ),
    newExpectation(
      "should find first release name",
      "[data-cy=release-item-release-name]:first",
      beVisible,
    ),
    newExpectation(
      "should find first release date",
      "[data-cy=release-list-item-date]:first",
      beVisible,
    ),
  ];

  runTests({ tests, currentPage, pageName });
});
