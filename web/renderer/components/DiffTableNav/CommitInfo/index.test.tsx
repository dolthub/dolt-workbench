import { MockedProvider } from "@apollo/client/testing";
import useMockRouter from "@hooks/useMockRouter";
import { render, screen } from "@testing-library/react";
import { commit as commitLink, diff } from "@lib/urls";
import CommitInfo from ".";
import * as mocks from "./mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

describe("test CommitInfo", () => {
  mocks.tests.forEach(test => {
    it(`renders CommitInfo for ${test.desc}`, async () => {
      useMockRouter(jestRouter, {
        asPath: diff({
          ...mocks.params,
          fromCommitId: test.commitId,
        }).asPathname(),
      });

      const commit = mocks.commitOpts[test.commitId];
      render(
        <MockedProvider mocks={[mocks.commitsQuery(test.commitId)]}>
          <CommitInfo
            params={{
              ...mocks.params,
              toCommitId: test.commitId,
              fromCommitId: commit.parents[0],
            }}
          />
        </MockedProvider>,
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();

      await screen.findByText(test.commitId);
      expect(screen.getByText(commit.message)).toBeInTheDocument();
      expect(
        screen.getByText(commit.committer.displayName),
      ).toBeInTheDocument();

      if (test.expectedParents === 1) {
        expect(screen.getByText("1 parent:")).toBeInTheDocument();
        expect(screen.queryByText("+")).not.toBeInTheDocument();
      } else {
        expect(screen.getByText("2 parents:")).toBeVisible();
        expect(screen.getByText("+")).toBeInTheDocument();
      }

      commit.parents.forEach(parent => {
        expect(screen.getByText(parent.slice(0, 7))).toHaveAttribute(
          "href",
          commitLink({ ...mocks.params, commitId: parent }).asPathname(),
        );
      });
    });
  });

  it("renders abbreviated CommitInfo for diff range", () => {
    const { fromCommitId } = mocks;
    const toCommitId = mocks.commitOneParent;
    useMockRouter(jestRouter, {
      asPath: diff({ ...mocks.params, fromCommitId, toCommitId }).asPathname(),
    });
    render(
      <CommitInfo params={{ ...mocks.params, toCommitId, fromCommitId }} />,
    );

    expect(screen.getByText(fromCommitId)).toBeVisible();
    expect(screen.getByText(toCommitId)).toBeVisible();
    expect(screen.queryByText("1 parent")).not.toBeInTheDocument();
  });
});
