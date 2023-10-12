import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderAndWait } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import DatabaseNav from ".";
import * as mocks from "./mocks";

describe("test for DatabaseNav", () => {
  it(`renders component`, async () => {
    await renderAndWait(
      <MockedProvider
        mocks={[...mocks.mocks, databaseDetailsMock(true, false)]}
      >
        <DatabaseNav params={mocks.refParams} initialTabIndex={0} />
      </MockedProvider>,
    );
    expect(await screen.findByText(/database/i)).toBeInTheDocument();
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    // expect(screen.getByText(/commit log/i)).toBeInTheDocument();
    // expect(screen.getByText(/releases/i)).toBeInTheDocument();
    // expect(screen.getByText(/pull requests/i)).toBeInTheDocument();
  });

  it(`renders component not dolt`, async () => {
    await renderAndWait(
      <MockedProvider
        mocks={[...mocks.mocks, databaseDetailsMock(false, true)]}
      >
        <DatabaseNav params={mocks.refParams} initialTabIndex={0} />
      </MockedProvider>,
    );
    expect(await screen.findByText(/database/i)).toBeInTheDocument();
    expect(screen.queryByText(/about/i)).not.toBeInTheDocument();
    // expect(screen.getByText(/commit log/i)).toBeInTheDocument();
    // expect(screen.getByText(/releases/i)).toBeInTheDocument();
    // expect(screen.getByText(/pull requests/i)).toBeInTheDocument();
  });
});
