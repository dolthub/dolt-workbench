import { doltGithubRepo } from "@lib/constants";
import { render, screen } from "@testing-library/react";
import ExternalLink from ".";

const href = doltGithubRepo;

describe("test ExternalLink", () => {
  it("renders ExternalLink", () => {
    render(
      <ExternalLink href={href} className="class-name" data-cy="data-cy-tag">
        Click Me
      </ExternalLink>,
    );

    const link = screen.getByText("Click Me");
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveClass("class-name");
    expect(link).toHaveAttribute("data-cy", "data-cy-tag");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
