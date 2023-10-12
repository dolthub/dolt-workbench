import { MockedProvider } from "@apollo/client/testing";
import { DocType } from "@gen/graphql-types";
import { getDocsQuery } from "@hooks/useEditDoc/utils";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { RefParams } from "@lib/params";
import { setup } from "@lib/testUtils.test";
import { sqlQuery } from "@lib/urls";
import { screen, waitFor } from "@testing-library/react";
import NewDocForm from ".";
import { docsMock, markdown } from "../DocList/mocks";

export const dbParams = { databaseName: "test" };
export const params: RefParams = { ...dbParams, refName: "master" };

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

const docTitle = "Add a README or LICENSE";

describe("test NewDocForm", () => {
  it("renders new doc form for no docs", async () => {
    useMockRouter(jestRouter, {});
    const { user } = setup(
      <MockedProvider mocks={[docsMock(params, [])]}>
        <NewDocForm params={params} />
      </MockedProvider>,
    );

    expect(await screen.findByText(docTitle)).toBeVisible();
    expect(await screen.findByText("LICENSE")).toBeVisible();

    const button = screen.getByText("Create");
    expect(button).toBeDisabled();

    const textarea = screen.getByPlaceholderText("Add markdown here");
    expect(textarea).toBeVisible();

    await user.type(textarea, markdown);
    expect(textarea).toHaveValue(markdown);
    expect(button).toBeEnabled();

    await user.click(button);

    const { href, as } = sqlQuery({
      ...params,
      q: getDocsQuery(DocType.License, markdown),
    });
    await waitFor(() => expect(actions.push).toHaveBeenCalledWith(href, as));
  });
});
