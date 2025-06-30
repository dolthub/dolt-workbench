import {
  shouldBeVisible,
  shouldFindButton,
} from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { testFetchFromRemote } from "@utils/sharedTests/remoteActions";

const pageName = "Remotes page";
const connectionName = "CypressTestConnection";
const dbName = "us-jails-2";
const branchName = "main";
const currentPage = `database/${dbName}/remotes?refName=${branchName}`;
const remoteName = "origin";
const hasDocs = true;

describe(pageName, () => {
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    shouldFindButton("add-remote-button"),
    shouldBeVisible("remote-list"),
    ...testFetchFromRemote(remoteName),
  ];

  runTests({ tests, currentPage, pageName });
});
