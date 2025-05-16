import {
  newClickFlow,
  newExpectation,
  newExpectationWithClickFlows,
} from "../helpers";
import {
  beVisible,
  notExist,
  shouldBeVisible,
  shouldClickAndFind,
  shouldFindAndContain,
  shouldNotExist,
} from "./sharedFunctionsAndVariables";
import { Expectation, ShouldArgs } from "../types";
import excerpt from "./excerpt";

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

    // RELEASE TAB
    newExpectation(
      `should ${tabsVisibility}have Release tab`,
      "[data-cy=db-releases-tab]",
      visibility,
    ),

    // PULL REQUESTS TAB
    newExpectation(
      `should ${tabsVisibility}have Pull Requests tab`,
      "[data-cy=db-pull-requests-tab]",
      visibility,
    ),

    // REMOTE TAB
    newExpectation(
      `should ${tabsVisibility}have Remote tab`,
      "[data-cy=db-remotes-tab]",
      visibility,
    ),
  ];
};

const testDatabaseSelector = (connectionName: string, dbName: string) => {
  const name = `${excerpt(connectionName, 12)} / ${excerpt(dbName, 12)}`;
  return [
    shouldFindAndContain("database-selector-button", name),
    shouldClickAndFind(
      "database-selector-button",
      "connection-and-database-popup",
    ),
    shouldBeVisible("connections-list"),
    shouldBeVisible(`connection-${connectionName}`),
    shouldBeVisible(`current-database-${dbName}`),
    newExpectationWithClickFlows(
      "should find and click  database-selector-button",
      "[data-cy=database-selector-button]",
      beVisible,
      [
        newClickFlow("[data-cy=database-selector-button]", [
          shouldNotExist("connection-and-database-popup"),
        ]),
      ],
    ),
  ];
};

export const conditionalReadMeTest = (hasDocs: boolean) => {
  const docsExpectation: Expectation = hasDocs
    ? newExpectation(
        "should not have README link",
        "[data-cy=dropdown-new-docs-link]",
        notExist,
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
      shouldBeVisible("add-dropdown-upload-a-file-link"),
      shouldBeVisible("add-dropdown-new-release-link"),
      conditionalReadMeTest(hasDocs),
    ],
    "[data-cy=db-page-header] [data-cy=add-dropdown-button]",
  );

export const testDBHeader = (
  connectionName: string,
  dbName: string,
  hasDocs: boolean,
) => [
  ...testTabs(beVisible),
  shouldBeVisible("reset-button"),
  newExpectationWithClickFlows(
    "should have functioning nav dropdown",
    "[data-cy=db-page-header] [data-cy=add-dropdown-button]",
    beVisible,
    [databaseDropdownClickFlow(hasDocs)],
  ),
  ...testDatabaseSelector(connectionName, dbName),
];
