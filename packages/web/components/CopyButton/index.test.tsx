import { setup } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import CopyButton from "./index";

describe("Test copy button", () => {
  it("renders copy button properly", async () => {
    const buttonText = "CopyButton test";
    const { user } = setup(<CopyButton text={buttonText} />);

    const button = screen.getByRole("button");
    window.prompt = jest.fn();

    expect(button).toHaveTextContent("Copy");

    await user.click(button);

    expect(button).toHaveTextContent("Copied");
    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      buttonText,
    );
  });
});
