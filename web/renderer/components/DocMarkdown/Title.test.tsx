import { render, screen } from "@testing-library/react";
import Title from "./Title";

const licenseSubtitle = "Terms under which this data is made available.";
const noDoc = "There is no doc to display.";
const readme = "README.md";
const license = "LICENSE.md";

describe("test Title", () => {
  it("renders title with no doltDocsQueryDocName or docName", () => {
    render(<Title />);

    expect(screen.getByText(noDoc)).toBeVisible();
    expect(screen.queryByText(licenseSubtitle)).not.toBeInTheDocument();
    expect(screen.queryByText(readme)).not.toBeInTheDocument();
    expect(screen.queryByText(license)).not.toBeInTheDocument();
  });

  it("renders title with doltDocsQueryDocName and no docName", () => {
    render(<Title doltDocsQueryDocName={readme} />);

    expect(screen.queryByText(noDoc)).not.toBeInTheDocument();
    expect(screen.queryByText(licenseSubtitle)).not.toBeInTheDocument();
    expect(screen.getByText(readme)).toBeVisible();
    expect(screen.queryByText(license)).not.toBeInTheDocument();
  });

  it("renders title with docName and no doltDocsQueryDocName", () => {
    render(<Title docName={license} />);

    expect(screen.queryByText(noDoc)).not.toBeInTheDocument();
    expect(screen.getByText(licenseSubtitle)).toBeVisible();
    expect(screen.queryByText(readme)).not.toBeInTheDocument();
    expect(screen.getByText(license)).toBeVisible();
  });

  it("renders title with docName and doltDocsQueryDocName", () => {
    render(<Title docName={readme} doltDocsQueryDocName={license} />);

    expect(screen.queryByText(noDoc)).not.toBeInTheDocument();
    expect(screen.queryByText(licenseSubtitle)).not.toBeInTheDocument();
    expect(screen.getByText(readme)).toBeVisible();
    expect(screen.queryByText(license)).not.toBeInTheDocument();
  });

  it("renders title with docName and children", () => {
    render(
      <Title docName={license}>
        <div>Button children</div>
      </Title>,
    );

    expect(screen.queryByText(noDoc)).not.toBeInTheDocument();
    expect(screen.getByText(licenseSubtitle)).toBeVisible();
    expect(screen.queryByText(readme)).not.toBeInTheDocument();
    expect(screen.getByText(license)).toBeVisible();
    expect(screen.getByText("Button children")).toBeVisible();
  });
});
