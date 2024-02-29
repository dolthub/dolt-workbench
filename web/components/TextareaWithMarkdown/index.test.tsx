import { fireEvent, render, screen } from "@testing-library/react";
import TextareaWithMarkdown from ".";

describe("test TextareaWithMarkdown", () => {
  it("renders textarea", () => {
    const onChange = jest.fn();
    render(<TextareaWithMarkdown value="Hello" rows={4} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("aria-label", "textarea");
    expect(input).toHaveTextContent("Hello");

    fireEvent.change(input, { target: { value: "Test" } });
    expect(onChange).toHaveBeenCalledWith("Test");
  });

  it("renders active tabs correctly", () => {
    const onChange = jest.fn();
    render(<TextareaWithMarkdown value="Hello" rows={4} onChange={onChange} />);

    const [write, preview] = screen.getAllByRole("listitem");
    const buttons = screen.getAllByRole("button");
    expect(write).toHaveClass("tab", "activeTab");
    expect(preview).toHaveClass("tab");
    expect(preview).not.toHaveClass("activeTab");

    fireEvent.click(buttons[1]);
    expect(write).toHaveClass("tab");
    expect(write).not.toHaveClass("activeTab");
    expect(preview).toHaveClass("tab", "activeTab");
  });

  // Skipping until we don't need the ReactMarkdown mock https://github.com/remarkjs/react-markdown/issues/635
  it.skip("correctly renders markdown", () => {
    const onChange = jest.fn();
    render(
      <TextareaWithMarkdown
        value={
          "[Hello](https://www.google.com)\n# Test\n* Bulletpoint\n* Bulletpoint\n* Bulletpoint"
        }
        rows={4}
        onChange={onChange}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveTextContent(
      "[Hello](https://www.google.com) # Test * Bulletpoint * Bulletpoint * Bulletpoint",
    );
    fireEvent.click(buttons[1]);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Hello");
    expect(link).toHaveProperty("href", "https://www.google.com/");

    const header = screen.getByRole("heading");
    expect(header).toHaveTextContent("Test");

    const lists = screen.getAllByRole("list");
    const markdownList = lists[1];
    expect(markdownList.childNodes).toHaveLength(3);

    markdownList.childNodes.forEach(mdChild => {
      expect(mdChild).toHaveTextContent("Bulletpoint");
    });
  });
});
