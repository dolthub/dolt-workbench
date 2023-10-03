import { MockedProvider } from "@apollo/client/testing";
import { renderAndWait } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import DatabaseNav from ".";
import * as mocks from "./mocks";

describe("test for DatabaseNav", () => {
  it(`renders component`, async () => {
    await renderAndWait(
      <MockedProvider>
        <DatabaseNav params={mocks.refParams} initialTabIndex={0} />
      </MockedProvider>,
    );
    expect(await screen.findByText(/database/i)).toBeInTheDocument();
    // expect(screen.getByText(/about/i)).toBeInTheDocument();
    // expect(screen.getByText(/commit log/i)).toBeInTheDocument();
    // expect(screen.getByText(/releases/i)).toBeInTheDocument();
    // expect(screen.getByText(/pull requests/i)).toBeInTheDocument();
  });
});
