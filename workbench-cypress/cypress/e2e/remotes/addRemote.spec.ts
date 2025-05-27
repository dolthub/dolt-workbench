import {
  beExist,
  beVisible,
  shouldBeVisible,
} from "@sharedTests/sharedFunctionsAndVariables";
import { testDBHeader } from "@utils/sharedTests/dbHeaders";
import { runTests } from "@utils/index";
import { newClickFlow, newExpectationWithClickFlows } from "@utils/helpers";

const pageName = "New Remote page";
const connectionName = "CypressTestConnection";
const dbName = "us-jails-2";
const currentPage = `database/${dbName}/remotes/new`;
const hasDocs = true;

describe(pageName, () => {
  const formTestsForRemoteType = [
    newExpectationWithClickFlows(
      "should find DoltHub radio",
      "[data-cy=remote-type-dolthub]",
      beExist,
      [
        newClickFlow("[data-cy=remote-type-dolthub]", [
          shouldBeVisible("dolthub-remote-owner-name-input"),
          shouldBeVisible("dolthub-remote-database-name-input"),
        ]),
      ],
    ),
    newExpectationWithClickFlows(
      "should find DoltLab radio",
      "[data-cy=remote-type-doltlab]",
      beExist,
      [
        newClickFlow("[data-cy=remote-type-doltlab]", [
          shouldBeVisible("doltlab-remote-host-input"),
        ]),
      ],
    ),
    newExpectationWithClickFlows(
      "should find Other radio",
      "[data-cy=remote-type-other]",
      beExist,
      [
        newClickFlow("[data-cy=remote-type-other]", [
          shouldBeVisible("other-remote-url-input"),
        ]),
      ],
    ),
  ];
  const tests = [
    ...testDBHeader(connectionName, dbName, hasDocs),
    shouldBeVisible("add-remote-form"),
    shouldBeVisible("remote-name-input"),
    shouldBeVisible("remote-type-radios"),
    ...formTestsForRemoteType,
    shouldBeVisible("add-remote-button"),
  ];

  runTests({ tests, currentPage, pageName });
});
