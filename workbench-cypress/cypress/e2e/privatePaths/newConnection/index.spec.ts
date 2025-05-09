import { runTests } from "@utils/index";
import { addWorkbenchTestConnection } from "@utils/sharedTests/addConnection";

const pageName = "New Connection";
const currentPage = "/connections/new";

describe(`${pageName} renders expected components`, () => {
  const tests = [...addWorkbenchTestConnection("workbench-test")];
  runTests({ tests, currentPage, pageName });
});
