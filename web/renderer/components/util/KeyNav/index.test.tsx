/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen } from "@testing-library/react";
import KeyNav from ".";

describe("tests KeyNav", () => {
  it("renders in focus KeyNav", () => {
    const onScroll = jest.fn();
    render(
      <div>
        <KeyNav onScroll={onScroll} className="class-name">
          <div>Child</div>
        </KeyNav>
      </div>,
    );
    const main = document.getElementById("main-content");
    if (!main) {
      throw new Error("could not find main element by ID");
    }
    expect(main).toBeVisible();
    expect(main).toHaveFocus();
    expect(main).toHaveClass("class-name");
    expect(main.tagName.toLowerCase()).toEqual("main");
    expect(screen.getByText("Child")).toBeVisible();

    expect(onScroll).toHaveBeenCalledTimes(0);
    fireEvent.scroll(main);
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("renders in focus KeyNav with custom tag and id", () => {
    const onScroll = jest.fn();
    render(
      <div>
        <KeyNav
          onScroll={onScroll}
          className="class-name"
          id="scroll-container"
          tag="nav"
        >
          <div>Child</div>
        </KeyNav>
      </div>,
    );
    const nav = document.getElementById("scroll-container");
    if (!nav) {
      throw new Error("could not find scroll element by ID");
    }
    expect(nav).toBeVisible();
    expect(nav).toHaveFocus();
    expect(nav).toHaveClass("class-name");
    expect(nav.tagName.toLowerCase()).toEqual("nav");
    expect(screen.getByText("Child")).toBeVisible();

    expect(onScroll).toHaveBeenCalledTimes(0);
    fireEvent.scroll(nav);
    expect(onScroll).toHaveBeenCalledTimes(1);
  });
});
