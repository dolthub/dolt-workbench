import { render, RenderResult, screen, waitFor } from "@testing-library/react";
import { JSXElementConstructor, ReactElement } from "react";

/**
 * Waits for all query loaders to disappear
 */
export async function waitForQueryLoaders(): Promise<void> {
  await waitFor(() =>
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument(),
  );
}

/**
 * Renders the given component and waits for queries to load
 */
export async function renderAndWait(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ui: ReactElement<any, string | JSXElementConstructor<any>>,
): Promise<RenderResult> {
  const result = render(ui);

  await waitForQueryLoaders();

  return result;
}

// Need to place the above functions in a .test.tsx file, so there needs to be atleast one test in the file
describe("utils test", () => {
  it("works", () => {});
});
