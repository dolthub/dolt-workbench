import { enumKeys } from "@dolthub/web-utils";
import { PullState } from "@gen/graphql-types";
import { render, screen } from "@testing-library/react";
import PullStateLabel from ".";

const className = "some-class-name";
const defaultState = PullState.Open;

describe("test PullStateLabel", () => {
  enumKeys(PullState).forEach(key => {
    it(`displays the "${key}" pull state`, () => {
      const state = PullState[key];
      render(<PullStateLabel state={state} />);
      // getByText will throw if the Pull State text is missing
      screen.getByText(key);
    });
  });

  it("applies the given className", async () => {
    render(<PullStateLabel state={defaultState} className={className} />);
    const span = screen.getByText(defaultState);
    expect(span).toHaveClass(className);
  });
});
