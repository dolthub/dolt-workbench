import { MockedProvider } from "@apollo/client/testing";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { renderAndWait } from "@lib/testUtils.test";
import { sqlQuery } from "@lib/urls";
import { fireEvent, screen } from "@testing-library/react";
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
        <SqlEditorProvider>
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
      "https://docs.dolthub.com/sql-reference/version-control/dolt-system-tables#dolt_schemas",
    );
  });

  it("renders correctly with multiple views", async () => {
    useMockRouter(jestRouter, {});
    await renderAndWait(
      <MockedProvider mocks={[mocks.rowsForViewsMock]}>
        <SqlEditorProvider>
          <Views params={mocks.params} />
        </SqlEditorProvider>
      </MockedProvider>,
    );

    expect(await screen.findByRole("list")).toBeInTheDocument();

    mocks.rowsForViewsFragmentMock.forEach(mock => {
      const button = screen.getByText(mock.name);
      fireEvent.click(button);
      const { href, as } = sqlQuery({
        ...mocks.params,
        q: `SELECT * FROM \`${mock.name}\``,
        active: "Views",
      });
      expect(actions.push).toHaveBeenCalledWith(href, as);
    });
  });
});
