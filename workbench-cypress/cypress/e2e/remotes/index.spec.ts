import {
  shouldBeVisible,
  shouldFindButton,
} from "@sharedTests/sharedFunctionsAndVariables";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { runTests } from "@utils/index";
import { testRemoteActions } from "@utils/sharedTests/remoteActions";

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
    ...testRemoteActions(remoteName),
  ];

  runTests({ tests, currentPage, pageName });
});
