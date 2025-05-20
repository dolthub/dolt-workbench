import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "../helpers";
import { Tests } from "../types";
import { beVisible } from "./sharedFunctionsAndVariables";

type TestParams = {
  branchSelectorDataCy: string;
  optionalText?: string;
  destinationBranch: string;
  destinationBranchOptionalText?: string;
};

export const selectBranch = (testParams: TestParams): Tests => [
  newExpectationWithClickFlows(
    "should open base branch selector",
    `[data-cy=${testParams.branchSelectorDataCy}]`,
    beVisible,
    [newClickFlow(`[data-cy=${testParams.branchSelectorDataCy}]`, [])],
  ),
  newExpectationWithClickFlows(
    "should click on destination branch",
    `[data-cy=select-option-${testParams.destinationBranch}]`,
    beVisible,
    [
      newClickFlow(`[data-cy=select-option-${testParams.destinationBranch}]`, [
        newExpectation(
          "should show destination branch name",
          `[data-cy=single-value-${testParams.destinationBranch}]`,
          beVisible,
        ),
      ]),
    ],
  ),
];
