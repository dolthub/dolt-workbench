import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import DefinitionList from ".";
import * as mocks from "./mocks";

const params = {
  refName: "main",
  databaseName: "dbname",
};

const tableList = [[], [mocks.tableOne], [mocks.tableOne, mocks.tableTwo]];

describe("test DefinitionList", () => {
  tableList.forEach(tables => {
    it(`renders DefinitionList component with ${tables.length} tables `, async () => {
      render(
        <MockedProvider mocks={mocks.mocks(params, tables)}>
          <DefinitionList
            params={{
              ...params,
              q: mocks.getQ(tables),
            }}
          />
        </MockedProvider>,
      );

      if (tables.length === 0) {
        expect(
          await screen.findByLabelText("db-tables-empty-ref"),
        ).toHaveTextContent(params.refName);
        expect(screen.getByText("No tables found")).toBeVisible();
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
