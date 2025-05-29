import { Route } from "@dolthub/web-utils";
import { setup } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import GoBack from ".";

const mockRoute = new Route("/test");

describe("tests GoBack", () => {
  it("renders correctly with required props", () => {
    setup(<GoBack url={mockRoute} pageName="Test Page" />);

    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.getByText("back to Test Page")).toBeInTheDocument();
  });

  it("renders with mobile styles when isMobile is true", () => {
    const { container } = setup(
      <GoBack url={mockRoute} pageName="Test Page" isMobile />
    );

    const goBackDiv = container.firstChild as HTMLElement;
    expect(goBackDiv).toHaveClass("isMobile");
  });

  it("renders without mobile styles when isMobile is false", () => {
    const { container } = setup(
      <GoBack url={mockRoute} pageName="Test Page" isMobile={false} />
    );

    const goBackDiv = container.firstChild as HTMLElement;
    expect(goBackDiv).not.toHaveClass("isMobile");
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-class";
    const { container } = setup(
      <GoBack url={mockRoute} pageName="Test Page" className={customClass} />
    );

    const goBackDiv = container.firstChild as HTMLElement;
    expect(goBackDiv).toHaveClass(customClass);
  });

  it("renders with icon", () => {
    setup(<GoBack url={mockRoute} pageName="Test Page" />);

    // Check that the icon component is rendered (by checking for the svg element)
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("sets correct href on link from route", () => {
    setup(<GoBack url={mockRoute} pageName="Test Page" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("renders with different page names", () => {
    setup(<GoBack url={mockRoute} pageName="Dashboard" />);

    expect(screen.getByText("back to Dashboard")).toBeInTheDocument();
  });

  it("combines all props correctly", () => {
    const customClass = "test-class";
    const { container } = setup(
      <GoBack
        url={mockRoute}
        pageName="Complex Page"
        isMobile
        className={customClass}
      />
    );

    const goBackDiv = container.firstChild as HTMLElement;
    expect(goBackDiv).toHaveClass("goback");
    expect(goBackDiv).toHaveClass("isMobile");
    expect(goBackDiv).toHaveClass(customClass);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
    expect(screen.getByText("back to Complex Page")).toBeInTheDocument();
  });
});