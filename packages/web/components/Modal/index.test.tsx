import { fireEvent, render, screen } from "@testing-library/react";
import Modal from ".";

describe("test Modal", () => {
  it("renders a closed modal", () => {
    const onRequestClose = jest.fn();
    render(
      <Modal isOpen={false} title="Modal" onRequestClose={onRequestClose}>
        <div>Inner component</div>
      </Modal>,
    );

    expect(screen.queryByText("Modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Inner component")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("close")).not.toBeInTheDocument();
  });

  it("renders an open modal", () => {
    const onRequestClose = jest.fn();
    render(
      <Modal
        isOpen
        title="Modal"
        onRequestClose={onRequestClose}
        className="class-name"
      >
        <div>Inner component</div>
      </Modal>,
    );

    const modal = screen.getByRole("dialog");
    expect(modal).toBeVisible();
    expect(modal).toHaveClass("class-name");
    expect(screen.getByText("Modal")).toBeVisible();
    expect(screen.getByText("Inner component")).toBeVisible();

    const close = screen.getByLabelText("close");
    expect(close).toBeVisible();
    expect(onRequestClose).toHaveBeenCalledTimes(0);
    fireEvent.click(close);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
