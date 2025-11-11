import { MockedProvider } from "@apollo/client/testing";
import useMockRouter from "@hooks/useMockRouter";
import { RefParams } from "@lib/params";
import { setup } from "@lib/testUtils.test";
import { database } from "@lib/urls";
import { screen } from "@testing-library/react";
import TableList from ".";
import * as mocks from "./mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

jest.mock("@hooks/useDatabaseDetails", () => {
  return {
    __esModule: true,
    default: () => {
      return {
        isDolt: true,
        isPostgres: false,
        disableDoltFeature: false,
        hideDoltFeature: false,
        loading: false,
        error: undefined,
      };
    },
  };
});

const params: RefParams = {
  databaseName: "test",
  refName: "main",
};

const tableLists = [[], [mocks.tableOne], [mocks.tableOne, mocks.tableTwo]];

describe("test TableList", () => {
  tableLists.forEach(tables => {
    it(`renders TableList component with ${tables.length} tables `, async () => {
      const url = database(params);

      useMockRouter(jestRouter, {
        asPath: url.asPathname(),
        pathname: url.hrefPathname(),
      });

      const { user } = setup(
        <MockedProvider mocks={mocks.mocks(params, tables)}>
          <TableList params={params} />
        </MockedProvider>,
      );

      if (tables.length === 0) {
        expect(await screen.findByText(/no tables found for/i)).toBeVisible();
      } else {
        tables.forEach(async table => {
          expect(
            await screen.findByRole("button", { name: table.tableName }),
          ).toBeVisible();
          await user.click(
            screen.getByRole("button", { name: table.tableName }),
          );
          // TODO: Fix test
          expect(await screen.findByText(table.columns[0].name)).toBeVisible();
          await user.click(
            screen.getByRole("button", { name: table.tableName }),
          );
          // TODO: Fix test
          // expect(
          //   await screen.findByText(table.columns[0].name),
          // ).not.toBeInTheDocument();
        });
      }

      expect(
        await screen.findByRole("link", {
          name: "Add new table",
        }),
      ).toBeVisible();
    });
  });
});
