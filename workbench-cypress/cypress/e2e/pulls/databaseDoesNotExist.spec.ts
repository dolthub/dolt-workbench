import {
  shouldFindAndContain,
  shouldNotExist,
} from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";

const pageName = "Pull requests page for non-existent database";
const doesNotExistDB = "doesnotexist";
const currentPage = `/database/${doesNotExistDB}/pulls`;

describe(pageName, () => {
  const tests = [
    shouldFindAndContain("error-msg", "database not found"),
    shouldNotExist("pull-requests-table"),
  ];

  runTests({ tests, currentPage, pageName });
});
