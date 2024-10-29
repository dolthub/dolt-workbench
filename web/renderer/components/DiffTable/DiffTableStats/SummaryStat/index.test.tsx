import { render, screen } from "@testing-library/react";
import SummaryStat from ".";

describe("test SummaryStat", () => {
  it("renders stat with no value or count", () => {
    render(<SummaryStat statSingle="Row Added" statPlural="Rows Added" />);
    expect(screen.getByText("-")).toBeVisible();
  });

  it("renders stat with error", () => {
    render(
      <SummaryStat
        err={new Error("this is an error")}
        value={10}
        statSingle="Row Added"
        statPlural="Rows Added"
      />,
    );
    expect(screen.getByText("-")).toBeVisible();
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("renders stat with no count", () => {
    render(
      <SummaryStat value={10} statSingle="Row Added" statPlural="Rows Added" />,
    );
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(screen.getByText("10")).toBeVisible();
    expect(screen.getByText("Rows Added")).toBeVisible();
    expect(screen.queryByText("0.00%")).not.toBeInTheDocument();
  });

  it("renders stat with singular value", () => {
    render(
      <SummaryStat
        value={1}
        count={100}
        statSingle="Row Added"
        statPlural="Rows Added"
      />,
    );
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeVisible();
    expect(screen.getByText("Row Added")).toBeVisible();
    expect(screen.getByText("1.00%")).toBeVisible();
  });

  it("renders stat with >1 value", () => {
    render(
      <SummaryStat
        value={1000}
        count={10000}
        statSingle="Row Added"
        statPlural="Rows Added"
      />,
    );
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeVisible();
    expect(screen.getByText("Rows Added")).toBeVisible();
    expect(screen.getByText("10.00%")).toBeVisible();
  });
});
