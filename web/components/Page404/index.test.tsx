import { render, screen } from "@testing-library/react";
import Page404, { defaultTitle, errorText, notFoundText } from ".";
import { code404TestId } from "./Code404";

const mockError = SyntaxError("some syntax error");

describe("tests Page404 component", () => {
  it("displays 404 text when error is null", () => {
    render(<Page404 />);
    expect(screen.getByText(notFoundText)).toBeInTheDocument();
    expect(screen.getByTestId(code404TestId)).toBeInTheDocument();
  });

  it("displays error text when error is not null", () => {
    render(<Page404 error={mockError} />);
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });

  it("displays the default title when title is not specified", () => {
    render(<Page404 />);
    expect(screen.getByText(defaultTitle)).toBeInTheDocument();
  });

  it("displays title when specified", () => {
    const title = "A catastrophic error occurred.";
    render(<Page404 title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("displays children when specified", () => {
    const testid = "test-child";
    render(
      <Page404>
        <div data-testid={testid} />
      </Page404>,
    );
    expect(screen.getByTestId(testid)).toBeInTheDocument();
  });
});
