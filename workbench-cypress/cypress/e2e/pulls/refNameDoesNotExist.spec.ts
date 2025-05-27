import {
  shouldFindAndContain,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";

const pageName = "Pull requests page for non-existent database";
const doesNotExistDB = "doesnotexist";
const dbName = "us-jails";
const currentPage = `database/${dbName}/pulls?refName=${doesNotExistDB}`;

describe(pageName, () => {
  const tests = [
    shouldFindAndContain(
      "select-to-view-pulls",
      "Select branches to view pull request",
    ),
    shouldNotExist("pull-details-list"),
  ];

  runTests({ tests, currentPage, pageName });
});
