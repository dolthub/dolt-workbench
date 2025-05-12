import { testTabs } from "@utils/dbTabs";
import { runTests } from "@utils/index";
import { beVisible } from "@utils/sharedTests/sharedFunctionsAndVariables";

const pageName = "Database";
const currentPage = "/database/test";

describe(pageName, () => {
  const tests = [...testTabs(beVisible)];
  runTests({ tests, currentPage, pageName });
});
