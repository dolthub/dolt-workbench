import { fireEvent, render, screen } from "@testing-library/react";
import CodeBlock from ".";

describe("tests CodeBlock", () => {
  it("displays the provided children", () => {
    render(
      <CodeBlock>
        <code data-testid="code-test">Some test code</code>
      </CodeBlock>,
    );
    expect(screen.getByTestId("code-test")).toHaveTextContent("Some test code");
  });

  it("shows Copied to clipboard after clicking on the copy button", async () => {
    render(<CodeBlock.WithCopyButton textToCopy="code" />);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Copied to clipboard");
  });
});
