import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
  newShouldArgs,
} from "../helpers";
import { Expectation, ShouldArgs, Tests } from "../types";

const beVisible = newShouldArgs("be.visible");
const notBeVisible = newShouldArgs("not.be.visible");

// DATABASE DROPDOWN CLICK FLOW

export const conditionalReadMeTest = (hasDocs: boolean) => {
  const docsExpectation: Expectation = hasDocs
    ? newExpectation(
        "should not have README link",
        "[data-cy=dropdown-new-docs-link]",
        newShouldArgs("not.exist"),
      )
    : newExpectation(
        "should have a create new readme link",
        "[data-cy=dropdown-new-docs-link]",
        beVisible,
      );

  return docsExpectation;
};

export const databaseDropdownClickFlow = (hasDocs: boolean) =>
  newClickFlow(
    "[data-cy=db-page-header] [data-cy=add-dropdown-button]",
    [
      // newExpectation(
      //   "should have a create new table link",
      //   "[data-cy=dropdown-create-new-table-link]",
      //   beVisible,
      // ),
      newExpectation(
        "should have a upload a file link",
        "[data-cy=add-dropdown-upload-a-file-link]",
        beVisible,
      ),
      // newExpectation(
      //   "should have a create new issue link",
      //   "[data-cy=dropdown-new-issue-link]",
      //   beVisible,
      // ),
      newExpectation(
        "should have a create new pull request link",
        "[data-cy=add-dropdown-new-pull-request-link]",
        beVisible,
      ),
      conditionalReadMeTest(hasDocs),
    ],
    "[data-cy=db-page-header] [data-cy=add-dropdown-button]",
  );

export const testTabs = (visibility: ShouldArgs): Expectation[] => {
  const tabsVisibility = visibility.chainer === "be.visible" ? "" : "not ";
  return [
    // DATABASE TAB
    newExpectation(
      `should ${tabsVisibility}have Database tab`,
      "[data-cy=db-database-tab]",
      visibility,
    ),

    // ABOUT TAB

    newExpectation(
      `should ${tabsVisibility}have About tab`,
      "[data-cy=db-about-tab]",
      visibility,
    ),

    // COMMIT LOG TAB
    newExpectation(
      `should ${tabsVisibility}have Commit Log tab`,
      "[data-cy=db-commit-log-tab]",
      visibility,
    ),

    // RELEASES TAB

    newExpectation(
      `should ${tabsVisibility}have Tag List tab`,
      "[data-cy=db-releases-tab]",
      visibility,
    ),

    // PULL REQUESTS TAB

    newExpectation(
      `should ${tabsVisibility}have Pull Requests tab`,
      "[data-cy=db-pull-requests-tab]",
      visibility,
    ),
  ];
};

export const testCommonHeader = (
  ownerName: string,
  depName: string,
  dbName: string,
): Expectation[] => [
  newExpectation(
    "should have database header",
    "[data-cy=db-page-header]",
    beVisible,
  ),
  newExpectation(
    "should have owner's name",
    "[data-cy=db-breadcrumbs]",
    newShouldArgs("be.visible.and.contain", ownerName),
  ),
  newExpectation(
    "should have deployment's name",
    "[data-cy=db-breadcrumbs]",
    newShouldArgs("be.visible.and.contain", depName),
  ),
  newExpectation(
    "should have database's name",
    "[data-cy=dep-db-breadcrumb-link]",
    newShouldArgs("be.visible.and.contain", dbName),
  ),
];

export const testDBHeaderForAll = (
  ownerName: string,
  depName: string,
  dbName: string,
  hasDocs: boolean,
  isIpad = false,
): Tests => {
  const tests = isIpad
    ? [
        ...testCommonHeader(depName, ownerName, dbName),
        newExpectation(
          "should have exit button",
          "[data-cy=database-exit-button]",
          beVisible,
        ),
        // newExpectation(
        //   "should not have db clone button",
        //   "[data-cy=db-clone-button]",
        //   notBeVisible,
        // ),
        ...testTabs(beVisible),
        // newExpectation(
        //   "should not have nav dropdown",
        //   "[data-cy=dropdown-database-nav]",
        //   notBeVisible,
        // ),
      ]
    : [
        ...testCommonHeader(depName, ownerName, dbName),
        // newExpectation(
        //   "should have exit button",
        //   "[data-cy=database-exit-button]",
        //   beVisible,
        // ),
        // newExpectationWithClickFlows(
        //   "should have db clone button",
        //   "[data-cy=db-clone-button]",
        //   beVisible,
        //   [cloneClickFlow],
        // ),
        ...testTabs(beVisible),
        newExpectationWithClickFlows(
          "should have functioning nav dropdown",
          "[data-cy=db-page-header] [data-cy=add-dropdown-button]",
          beVisible,
          [databaseDropdownClickFlow(hasDocs)],
        ),
      ];

  return tests;
};

export const testMobileDBHeaderNav = (
  ownerName: string,
  depName: string,
  dbName: string,
): Expectation[] => [
  ...testCommonHeader(ownerName, depName, dbName),
  newExpectation(
    "should not have nav dropdown",
    "[data-cy=add-dropdown-button]",
    notBeVisible,
  ),
  ...testTabs(notBeVisible),
];

export const testDBHeaderWithBranch = (
  ownerName: string,
  depName: string,
  dbName: string,
  hasDocs: boolean,
  isIpad = false,
): Tests => [
  ...testDBHeaderForAll(ownerName, depName, dbName, hasDocs, isIpad),
];
