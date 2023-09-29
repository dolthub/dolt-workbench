import { render, screen } from "@testing-library/react";
import ErrorMsg from ".";

const errMsg = "Shit, something went wrong";
const timeoutErrMsg = "upstream request timeout";
const improvedTimeoutErrMsg = "Request timed out. Please try again.";

describe("test ErrorMsg", () => {
  it("improves Errors", () => {
    render(<ErrorMsg err={new Error(timeoutErrMsg)} />);
    const result = screen.getByText(improvedTimeoutErrMsg);
    expect(result).toBeInTheDocument();
  });

  it("improves strings", () => {
    render(<ErrorMsg errString={timeoutErrMsg} />);
    const result = screen.getByText(improvedTimeoutErrMsg);
    expect(result).toBeInTheDocument();
  });

  it("renders the err if both err and errString provided", () => {
    render(<ErrorMsg errString={timeoutErrMsg} err={new Error(errMsg)} />);
    expect(screen.getByText(errMsg)).toBeInTheDocument();
    expect(screen.queryByText(improvedTimeoutErrMsg)).not.toBeInTheDocument();
  });
});
