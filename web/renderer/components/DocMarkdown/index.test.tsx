import { MockedProvider } from "@apollo/client/testing";
import { DocType } from "@gen/graphql-types";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { RefParams } from "@lib/params";
import { setup } from "@lib/testUtils.test";
import { sqlQuery } from "@lib/urls";
import { getDoc } from "@pageComponents/DatabasePage/ForDocs/DocsPage/DocList/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import DocMarkdown from ".";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

const params: RefParams = {
  refName: "master",
  databaseName: "dbname",
};

describe("test DocMarkdown", () => {
  it("renders for no existing default doc and no docName param", () => {
    render(
      <MockedProvider>
        <DocMarkdown params={params} rowData={undefined} />
      </MockedProvider>,
    );

    expect(screen.getByText("There is no doc to display.")).toBeVisible();
    expect(screen.getByText("Doc not found")).toBeVisible();
  });

  it("renders for no existing default doc and docName param", () => {
    const docName = "README.md";
    render(
      <MockedProvider>
        <DocMarkdown params={{ ...params, docName }} rowData={undefined} />
      </MockedProvider>,
    );

    expect(screen.getByText(docName)).toBeVisible();
    expect(screen.getByText(`${docName} not found`)).toBeVisible();
    expect(screen.getByText(`Add ${docName}`)).toBeVisible();
    expect(screen.queryByText("delete")).not.toBeInTheDocument();
    expect(screen.queryByText("edit")).not.toBeInTheDocument();
  });

  it("renders for existing default doc (README) and no docName param", () => {
    const docName = "README.md";
    render(
      <MockedProvider>
        <DocMarkdown params={params} rowData={getDoc(DocType.Readme)} />
      </MockedProvider>,
    );

    expect(screen.getByText(docName)).toBeVisible();
    expect(screen.getByLabelText("markdown")).toBeVisible();
    expect(screen.getByText(/Header/)).toBeVisible();
    expect(screen.getByText("delete")).toBeInTheDocument();
    expect(screen.getByText("edit")).toBeInTheDocument();
  });

  it("renders for existing default doc (LICENSE) and no docName param", () => {
    const docName = "LICENSE.md";
    render(
      <MockedProvider>
        <DocMarkdown params={params} rowData={getDoc(DocType.License)} />
      </MockedProvider>,
    );

    expect(screen.getByText(docName)).toBeVisible();
    expect(screen.getByLabelText("markdown")).toBeVisible();
    expect(screen.getByText(/Header/)).toBeVisible();
    expect(
      screen.getByText("Terms under which this data is made available."),
    ).toBeVisible();
    expect(screen.getByText("delete")).toBeInTheDocument();
    expect(screen.getByText("edit")).toBeInTheDocument();
  });

  it("renders for existing default doc (README) and docName param (LICENSE)", () => {
    const docName = "LICENSE.md";
    render(
      <MockedProvider>
        <DocMarkdown
          params={{ ...params, docName }}
          rowData={getDoc(DocType.Readme)}
        />
      </MockedProvider>,
    );

    expect(screen.getByText(docName)).toBeVisible();
    expect(screen.getByText(`${docName} not found`)).toBeVisible();
    expect(screen.getByText(`Add ${docName}`)).toBeVisible();
    expect(screen.queryByText("delete")).not.toBeInTheDocument();
    expect(screen.queryByText("edit")).not.toBeInTheDocument();
  });

  it("renders README with buttons", async () => {
    useMockRouter(jestRouter, {});
    const docName = "README.md";
    const { user } = setup(
      <MockedProvider>
        <DocMarkdown
          params={{ ...params, docName }}
          rowData={getDoc(DocType.Readme)}
        />
      </MockedProvider>,
    );

    expect(screen.getByText(docName)).toBeVisible();
    expect(screen.getByLabelText("markdown")).toBeVisible();
    expect(screen.getByText(/Header/)).toBeVisible();

    expect(await screen.findByText("delete")).toBeVisible();

    await user.click(screen.getByText("edit"));
    expect(screen.getByLabelText("markdown-editor")).toBeVisible();

    await user.click(screen.getByText("delete"));
    const { href, as } = sqlQuery({
      ...params,
      q: `DELETE FROM dolt_docs WHERE doc_name='${docName}'`,
    });
    await waitFor(() => expect(actions.push).toHaveBeenCalledWith(href, as));
  });
});
