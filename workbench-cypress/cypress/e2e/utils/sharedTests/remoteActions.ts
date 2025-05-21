import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import { Tests } from "@utils/types";
import {
  beVisible,
  beVisibleAndContain,
  shouldBeVisible,
  shouldNotExist,
} from "./sharedFunctionsAndVariables";

type TestParams = {
  remoteName: string;
  buttonDataCy: string;
  modalTitle: string;
};

const openActionModal = (testParams: TestParams): Tests => [
  newExpectationWithClickFlows(
    "should find actions button",
    `[data-cy=remote-${testParams.remoteName}-action-button]`,
    beVisible,
    [
      newClickFlow(`[data-cy=remote-${testParams.remoteName}-action-button]`, [
        newExpectation(
          "should show actions dropdown",
          "[data-cy=actions-dropdown]",
          beVisible,
        ),
      ]),
    ],
  ),
  newExpectationWithClickFlows(
    "should open modal",
    `[data-cy=${testParams.buttonDataCy}]`,
    beVisible,
    [
      newClickFlow(`[data-cy=${testParams.buttonDataCy}]`, [
        newExpectation(
          "should show modal title",
          "[data-cy=modal-title]",
          beVisibleAndContain(testParams.modalTitle),
        ),
      ]),
    ],
  ),
];

const testFetchFromRemote = (remoteName: string): Tests => {
  const testParams = {
    remoteName,
    buttonDataCy: "fetch-button",
    modalTitle: "Sync with remote",
  };
  return [
    ...openActionModal(testParams),
    shouldBeVisible("fetch-from-remote-table"),
    newExpectationWithClickFlows(
      "should close fetch from remote modal",
      "[data-cy=close-modal]",
      beVisible,
      [newClickFlow("[data-cy=close-modal]", [shouldNotExist("modal-title")])],
    ),
  ];
};

const testPullFromRemote = (remoteName: string): Tests => {
  const testParams = {
    remoteName,
    buttonDataCy: "pull-button",
    modalTitle: "Pull from remote",
  };
  return [
    ...openActionModal(testParams),
    shouldBeVisible("remote-branch-name-input"),
    newExpectationWithClickFlows(
      "should close fetch from remote modal",
      "[data-cy=close-modal]",
      beVisible,
      [newClickFlow("[data-cy=close-modal]", [shouldNotExist("modal-title")])],
    ),
  ];
};

const testPushToRemote = (remoteName: string): Tests => {
  const testParams = {
    remoteName,
    buttonDataCy: "push-button",
    modalTitle: "Push to remote",
  };
  return [
    ...openActionModal(testParams),
    shouldBeVisible("branch-name-input"),
    newExpectationWithClickFlows(
      "should close fetch from remote modal",
      "[data-cy=close-modal]",
      beVisible,
      [newClickFlow("[data-cy=close-modal]", [shouldNotExist("modal-title")])],
    ),
  ];
};

export const testRemoteActions = (remoteName: string): Tests => [
  ...testFetchFromRemote(remoteName),
  ...testPullFromRemote(remoteName),
  ...testPushToRemote(remoteName),
];
