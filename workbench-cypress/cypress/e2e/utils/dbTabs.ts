import { newExpectation } from "./helpers";
import { Expectation, ShouldArgs } from "./types";

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
