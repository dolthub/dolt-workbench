import { MockedProvider } from "@apollo/client/testing";
import { SqlEditorContext } from "@contexts/sqleditor";
import { RefParams } from "@lib/params";
import { setup } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import CreateViewButton from ".";
import * as mocks from "./mocks";

const params: RefParams = {
  refName: "main",
  databaseName: "test",
};
const sqlString = `SELECT *\nFROM \`hhh\`\nLIMIT 200;\n`;
const viewName = "fakename";

describe("test for ViewQueryButton", () => {
  it("renders component for admin", async () => {
    const mock = mocks.createViewMock(
      params.databaseName,
      params.refName,
      viewName,
      sqlString,
    );
    const { user } = setup(
      <MockedProvider mocks={[mock]}>
        <SqlEditorContext.Provider
          value={mocks.SqlEditorContextProviderValueMock}
        >
          <CreateViewButton params={params} query={sqlString} />
        </SqlEditorContext.Provider>
      </MockedProvider>,
    );

    expect(
      await screen.findByRole("button", { name: "Create View" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Create View" }));

    expect(
      await screen.findByRole("heading", { name: "Create view" }),
    ).toBeVisible();

    const nameInput = screen.getByPlaceholderText("Name your view");
    await user.clear(nameInput);
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();

    await user.type(nameInput, viewName);
    expect(screen.getByRole("button", { name: "Create" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => {
      expect(mocks.setExecutedQuery).toHaveBeenCalledWith(
        `CREATE VIEW \`${viewName}\` AS ${sqlString}`,
        { isMutation: true },
      );
    });
    expect(mocks.setExecutionMessage).toHaveBeenCalledWith("Query OK.");
  });
});
