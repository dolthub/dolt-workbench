import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newExpectationWithURL,
} from "../helpers";
import { Tests } from "../types";
import {
  beVisible,
  beVisibleAndContain,
  shouldFindAndContain,
} from "./sharedFunctionsAndVariables";

type TestParams = {
  isLeftNavClosed: boolean;
  currentTabDataCy: string;
  destinationURL: string;
  optionalText?: string;
  destinationBranch: string;
  destinationBranchOptionalText?: string;
};

const checkCurrentBranch = (testParams: TestParams): Tests =>
  testParams.destinationBranchOptionalText
    ? [
        newExpectationWithURL(
          `should load page for tab ${testParams.currentTabDataCy}`,
          `[data-cy=${testParams.currentTabDataCy}]`,
          beVisible,
          testParams.destinationURL,
        ),
        shouldFindAndContain(
          testParams.currentTabDataCy,
          testParams.destinationBranchOptionalText,
        ),
      ]
    : [
        newExpectationWithURL(
          "should find destination page url",
          `[data-cy=${testParams.currentTabDataCy}]`,
          beVisible,
          testParams.destinationURL,
        ),
      ];

const branchSelectorClickFlow = (testParams: TestParams) =>
  newClickFlow(`[data-cy=branch-and-tag-selector]`, [
    newExpectationWithClickFlows(
      "should click on destination branch",
      `[data-cy=select-option-${testParams.destinationBranch}]`,
      beVisible,
      [
        newClickFlow(
          `[data-cy=select-option-${testParams.destinationBranch}]`,
          checkCurrentBranch(testParams),
        ),
      ],
    ),
  ]);

export const changeBranch = (testParams: TestParams): Tests => {
  const maybeOpenLeftNav = testParams.isLeftNavClosed
    ? [
        newExpectationWithClickFlows(
          "should open menu",
          `[data-cy=left-nav-toggle-icon]`,
          beVisible,
          [
            newClickFlow(`[data-cy=left-nav-toggle-icon]`, [
              newExpectation(
                "should have branch selector",
                `[data-cy=branch-and-tag-selector]`,
                beVisible,
              ),
            ]),
          ],
        ),
      ]
    : [];

  return [
    newExpectation(
      `should check current branch ${testParams.currentTabDataCy}`,
      `[data-cy=${testParams.currentTabDataCy}]`,
      testParams.optionalText
        ? beVisibleAndContain(testParams.optionalText)
        : beVisible,
    ),
    ...maybeOpenLeftNav,
    newExpectationWithClickFlows(
      "should open branch selector",
      `[data-cy=branch-and-tag-selector]`,
      beVisible,
      [branchSelectorClickFlow(testParams)],
    ),
  ];
};
