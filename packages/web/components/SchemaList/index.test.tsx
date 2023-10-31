import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import SchemaList from ".";
import * as mocks from "./mocks";

const params = {
  refName: "main",
  databaseName: "dbname",
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
        expect(await screen.findByText("No tables found on")).toBeVisible();
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
