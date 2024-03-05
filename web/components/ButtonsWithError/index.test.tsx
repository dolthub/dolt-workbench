import { Button } from "@dolthub/react-components";
import { fireEvent, render, screen } from "@testing-library/react";
import ButtonsWithError from ".";
import css from "./index.module.css";

const errString = "This is the worst error";

describe("test ButtonsWithError", () => {
  it("renders buttons without error", () => {
    const onCancel = jest.fn();
    const onClick = jest.fn();
    render(
      <ButtonsWithError onCancel={onCancel} className="class-name">
        <Button onClick={onClick}>Test Button</Button>
      </ButtonsWithError>,
    );

    const container = screen.getByLabelText("buttons-with-error");
    expect(container).toBeVisible();
    expect(container).toHaveClass("class-name");

    const cancelButton = screen.getByText("cancel");
    expect(cancelButton).toBeVisible();
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();

    const testButton = screen.getByText("Test Button");
    expect(testButton).toBeVisible();
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(testButton);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders buttons with error", () => {
    render(
      <ButtonsWithError onCancel={jest.fn()} error={new Error(errString)}>
        <Button>Test Button</Button>
      </ButtonsWithError>,
    );

    expect(screen.getByText("cancel")).toBeVisible();
    expect(screen.getByText("Test Button")).toBeVisible();

    expect(screen.getByText(errString)).toBeVisible();
  });

  it("renders buttons with error aligned left", () => {
    render(
      <ButtonsWithError onCancel={jest.fn()} error={new Error(errString)} left>
        <Button>Test Button</Button>
      </ButtonsWithError>,
    );

    const buttonGroup = screen.getByLabelText("button-group");
    expect(buttonGroup).toBeVisible();
    expect(buttonGroup).toHaveClass(css.left);

    expect(screen.getByText("cancel")).toBeVisible();
    expect(screen.getByText("Test Button")).toBeVisible();

    const err = screen.getByLabelText("error-msg");
    expect(err).toBeVisible();
    expect(err).toHaveClass(css.left);
  });
});
