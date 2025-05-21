import {
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
      `should find DoltHub radio`,
      `[data-cy=DoltHub-radio`,
      beVisible,
      [
        newClickFlow(`[data-cy=DoltHub-radio]`, [
          shouldBeVisible("dolthub-remote-owner-name-input"),
          shouldBeVisible("dolthub-remote-database-name-input"),
        ]),
      ],
    ),
    newExpectationWithClickFlows(
      `should find DoltLab radio`,
      `[data-cy=DoltLab-radio]`,
      beVisible,
      [
        newClickFlow(`[data-cy=DoltLab-radio]`, [
          shouldBeVisible("doltlab-remote-host-input"),
        ]),
      ],
    ),
    newExpectationWithClickFlows(
      `should find Other radio`,
      `[data-cy=Other-radio]`,
      beVisible,
      [
        newClickFlow(`[data-cy=Other-radio]`, [
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
