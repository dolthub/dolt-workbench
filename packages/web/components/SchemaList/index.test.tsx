import { MockedProvider } from "@apollo/client/testing";
import { RefParams } from "@lib/params";
import { render, screen } from "@testing-library/react";
import SchemaList from ".";
import * as mocks from "./mocks";

const params: RefParams = {
  databaseName: "dbname",
  refName: "main",
};

const tableList = [[], [mocks.tableOne], [mocks.tableOne, mocks.tableTwo]];

describe("test SchemaList", () => {
  tableList.forEach(tables => {
    it(`renders SchemaList component with ${tables.length} tables `, async () => {
      render(
        <MockedProvider mocks={mocks.mocks(params, tables)}>
          <SchemaList
            params={{
              ...params,
              q: mocks.getQ(tables),
            }}
          />
        </MockedProvider>,
      );

      if (tables.length === 0) {
        expect(await screen.findByText("No tables found for")).toBeVisible();
      } else {
        tables.forEach(async table => {
          expect(await screen.findByText(table)).toBeVisible();
          if (table === mocks.activeTableName) {
            expect(await screen.findByText("Viewing")).toBeVisible();
          } else {
            expect(await screen.findByRole("link")).toBeInTheDocument();
          }
        });
      }
    });
  });
});
