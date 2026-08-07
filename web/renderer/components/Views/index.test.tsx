import { MockedProvider } from "@apollo/client/testing";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter from "@hooks/useMockRouter";
import { renderAndWait } from "@lib/testUtils.test";
import { table } from "@lib/urls";
import { screen } from "@testing-library/react";
import Views from "./index";
import * as mocks from "./mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

describe("tests Views", () => {
  it("renders correctly with no views", async () => {
    await renderAndWait(
      <MockedProvider mocks={[mocks.rowsForEmptyViewsMock]}>
        <SqlEditorProvider params={mocks.params}>
          <Views params={mocks.params} />
        </SqlEditorProvider>
      </MockedProvider>,
    );

    const words = screen.getByText(/no views\. \?/i);
    const link = screen.getByRole("link");
    expect(words).toBeVisible();
    expect(link).toBeVisible();
    expect(link).toHaveTextContent("Add some");
    expect(link).toHaveProperty(
      "href",
      "https://dolthub.com/docs/sql-reference/version-control/dolt-system-tables#dolt_schemas",
    );
  });

  it("renders correctly with multiple views", async () => {
    useMockRouter(jestRouter, {});
    await renderAndWait(
      <MockedProvider mocks={[mocks.rowsForViewsMock]}>
        <SqlEditorProvider params={mocks.params}>
          <Views params={mocks.params} />
        </SqlEditorProvider>
      </MockedProvider>,
    );

    expect(await screen.findByRole("list")).toBeInTheDocument();

    mocks.rowsForViewsFragmentMock.forEach(mock => {
      const link = screen.getByRole("link", { name: new RegExp(mock.name) });
      const route = table({ ...mocks.params, tableName: mock.name });
      expect(link).toHaveAttribute("href", route.asPathname());
    });
  });
});
