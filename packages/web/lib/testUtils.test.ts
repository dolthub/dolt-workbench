import { render, RenderResult, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

/**
 * Renders the given component and waits for queries to load, returning the
 * result and user event
 */
export async function setupAndWait(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ui: ReactElement<any, string | JSXElementConstructor<any>>,
): Promise<RenderResult & { user: any }> {
  const result = render(ui);

  await waitForQueryLoaders();

  return { user: userEvent.setup(), ...result };
}

/**
 * Renders the given component, returning the result and user event
 */
export function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

// Need to place the above functions in a .test.tsx file, so there needs to be at least one test in the file
describe("utils test", () => {
  it("works", () => {});
});
