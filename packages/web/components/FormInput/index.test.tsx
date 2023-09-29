import { fireEvent, render, screen } from "@testing-library/react";
import FormInput from ".";

describe("test FormInput", () => {
  it("renders form input", () => {
    const onChange = jest.fn();
    render(
      <FormInput
        label="Name"
        className="class-name"
        placeholder="Placeholder text"
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.getByLabelText("form-input-container")).toHaveClass(
      "class-name",
    );

    const input = screen.getByPlaceholderText("Placeholder text");
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("type", "text");

    fireEvent.change(input, { target: { value: "new name" } });
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("new name");
  });

  it("renders form input with value", () => {
    render(
      <FormInput
        label="Name"
        className="class-name"
        placeholder="Placeholder text"
        value="email@email.com"
        type="email"
      />,
    );

    const input = screen.getByPlaceholderText("Placeholder text");
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveValue("email@email.com");
  });
});
