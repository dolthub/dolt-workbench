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
        shouldBeVisible("actions-dropdown", "should show actions dropdown"),
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

export const testFetchFromRemote = (remoteName: string): Tests => {
  const testParams = {
    remoteName,
    buttonDataCy: "fetch-button",
    modalTitle: "Manage remote branches",
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
