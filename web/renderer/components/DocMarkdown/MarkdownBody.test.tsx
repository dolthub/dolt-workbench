import { MockedProvider } from "@apollo/client/testing";
import useMockRouter from "@hooks/useMockRouter";
import { RefParams } from "@lib/params";
import { render, screen } from "@testing-library/react";
import MarkdownBody from "./MarkdownBody";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

const params: RefParams = {
  connectionName: "connection",
  databaseName: "test",
  refName: "master",
};
const docName = "README.md";

describe("test MarkdownBody", () => {
  it("renders doc not found for no doltDocsQueryDocName or docName", () => {
    render(
      <MarkdownBody
        params={params}
        showEditor={false}
        setShowEditor={jest.fn()}
      />,
    );

    expect(screen.getByText("Doc not found")).toBeVisible();
    expect(screen.queryByLabelText("markdown-editor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("markdown")).not.toBeInTheDocument();
  });

  it("renders readme not found for doltDocsQueryDocName not matching docName", () => {
    render(
      <MarkdownBody
        params={{ ...params, docName }}
        showEditor={false}
        setShowEditor={jest.fn()}
        doltDocsQueryDocName="LICENSE.md"
      />,
    );

    expect(screen.getByText(`${docName} not found`)).toBeVisible();
    expect(screen.queryByLabelText("markdown-editor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("markdown")).not.toBeInTheDocument();
  });

  it("renders readme not found for docName and no doltDocsQueryDocName", () => {
    render(
      <MarkdownBody
        params={{ ...params, docName }}
        showEditor={false}
        setShowEditor={jest.fn()}
      />,
    );

    expect(screen.getByText(`${docName} not found`)).toBeVisible();
    expect(screen.queryByLabelText("markdown-editor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("markdown")).not.toBeInTheDocument();
  });

  it("renders markdown for doltDocsQueryDocName and no docName", () => {
    render(
      <MarkdownBody
        params={params}
        showEditor={false}
        setShowEditor={jest.fn()}
        doltDocsQueryDocName={docName}
      />,
    );

    expect(screen.queryByLabelText("doc-not-found")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("markdown-editor")).not.toBeInTheDocument();
    expect(screen.getByLabelText("markdown")).toBeVisible();
  });

  it("renders editor for matching doltDocsQueryDocName and docName and true showEditor", () => {
    useMockRouter(jestRouter, {});
    render(
      <MockedProvider>
        <MarkdownBody
          params={{ ...params, docName }}
          showEditor
          setShowEditor={jest.fn()}
          doltDocsQueryDocName={docName}
        />
      </MockedProvider>,
    );

    expect(screen.queryByLabelText("doc-not-found")).not.toBeInTheDocument();
    expect(screen.getByLabelText("markdown-editor")).toBeVisible();
    expect(screen.queryByLabelText("markdown")).not.toBeInTheDocument();
  });
});
