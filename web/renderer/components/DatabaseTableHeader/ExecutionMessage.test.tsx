import { render, screen } from "@testing-library/react";
import ExecutionMessage from "./ExecutionMessage";

const mockContext = {
  executionMessage: undefined as string | undefined,
  setExecutionMessage: jest.fn(),
  executionError: undefined as string | undefined,
  setExecutionError: jest.fn(),
};

jest.mock("@contexts/sqleditor", () => {
  return {
    useSqlEditorContext: () => mockContext,
  };
});

describe("ExecutionMessage", () => {
  afterEach(() => {
    mockContext.executionMessage = undefined;
    mockContext.executionError = undefined;
  });

  it("renders nothing without a message", () => {
    const { container } = render(<ExecutionMessage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the execution message", () => {
    mockContext.executionMessage = "Query OK.";
    render(<ExecutionMessage />);
    expect(screen.getByText("Query OK.")).toBeVisible();
    expect(screen.getByRole("status")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders an error as the error variant", () => {
    mockContext.executionError = "table not found: nope";
    render(<ExecutionMessage />);
    expect(screen.getByText("table not found: nope")).toBeVisible();
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the error when both are somehow set", () => {
    mockContext.executionMessage = "Query OK.";
    mockContext.executionError = "it broke";
    render(<ExecutionMessage />);
    expect(screen.getByText("it broke")).toBeVisible();
    expect(screen.queryByText("Query OK.")).not.toBeInTheDocument();
  });
});
