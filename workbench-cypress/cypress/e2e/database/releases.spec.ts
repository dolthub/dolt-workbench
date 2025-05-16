import { testDBHeader } from "@utils/dbHeaders";
import { newExpectation, newShouldArgs } from "@utils/helpers";
import { runTests } from "@utils/index";

const pageName = "Releases page";
const dbName = "us-jails";
const currentPage = `/database/${dbName}/releases`;
const connectionName = "CypressTestConnection";
const hasDocs = true;

describe(pageName, () => {
  const notExist = newShouldArgs("not.exist");
  const beVisible = newShouldArgs("be.visible");

  const commonTests = [
    newExpectation(
      "should not find empty releases message",
      "[data-cy=release-list-no-releases]",
      notExist,
    ),
    newExpectation(
      "should have at least one tag",
      "[data-cy=release-list-item]",
      newShouldArgs("be.visible.and.have.length.of.at.least", 1),
    ),
    newExpectation(
      "should have release header",
      "[data-cy=release-list-header]",
      beVisible,
    ),
    newExpectation(
      "should find latest release label",
      "[data-cy=release-list-latest-label]",
      beVisible,
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

  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    ...commonTests,
  ];

  runTests({ tests, currentPage, pageName });
});
