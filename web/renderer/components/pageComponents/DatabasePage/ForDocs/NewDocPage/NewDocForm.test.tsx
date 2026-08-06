import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { SqlEditorProvider } from "@contexts/sqleditor";
import { DocType } from "@gen/graphql-types";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { RefParams } from "@lib/params";
import { setup } from "@lib/testUtils.test";
import { doc } from "@lib/urls";
import { screen, waitFor } from "@testing-library/react";
import { docsMock, markdown, saveDocMock } from "../DocsPage/DocList/mocks";
import NewDocForm from "./NewDocForm";

const dbParams = { databaseName: "test" };
const params: RefParams = { ...dbParams, refName: "master" };

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

const docTitle = "Add a doc";

describe("test NewDocForm", () => {
  beforeEach(() => {
    actions.push.mockClear();
  });

  it("renders new doc form for no docs", async () => {
    useMockRouter(jestRouter, {});
    const { user } = setup(
      <MockedProvider
        mocks={[
          docsMock(params, []),
          databaseDetailsMock(true, false),
          saveDocMock(params, DocType.Agent, markdown),
        ]}
      >
        <SqlEditorProvider params={params}>
          <NewDocForm params={params} />
        </SqlEditorProvider>
      </MockedProvider>,
    );

    expect(await screen.findByText(docTitle)).toBeVisible();

    const button = screen.getByText("Create");
    expect(button).toBeDisabled();

    const textarea = screen.getByPlaceholderText("Add markdown here");
    expect(textarea).toBeVisible();

    await user.type(textarea, markdown);
    expect(textarea).toHaveValue(markdown);
    expect(button).toBeEnabled();

    await user.click(button);

    const { href, as } = doc({ ...params, docName: "AGENT.md" });
    await waitFor(() => expect(actions.push).toHaveBeenCalledWith(href, as));
  });
});
