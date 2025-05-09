import { shouldFindAndContain } from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";

const pageName = "Homepage";
const currentPage = "/";

describe(pageName, () => {
  const tests = [
    shouldFindAndContain("welcome-title", "Welcome to the Dolt Workbench"),
    shouldFindAndContain(
      "welcome-message",
      "Connect the workbench to any MySQL or PostgreSQL compatible database. ",
    ),
  ];
  runTests({ tests, currentPage, pageName });
});
