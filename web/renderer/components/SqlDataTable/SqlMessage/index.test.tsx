import { ApolloError } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { QueryExecutionStatus } from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";
import { render, screen } from "@testing-library/react";
import SqlMessage from ".";

const params: SqlQueryParams = {
  connectionName: "connection",
  databaseName: "dbname",
  refName: "master",
  q: "SELECT * FROM tablename",
};

function renderComponent(props: {
  executionStatus?: QueryExecutionStatus;
  gqlError?: ApolloError;
  executionMessage?: string;
  rowsLen?: number;
}) {
  render(
    <MockedProvider mocks={[databaseDetailsMock(true, false)]}>
      <SqlMessage {...props} params={params} rowsLen={props.rowsLen ?? 0} />
    </MockedProvider>,
  );
}

describe("test SqlMessage", () => {
  it("renders error", () => {
    const errorMessage = "this is an error";
    renderComponent({ gqlError: new ApolloError({ errorMessage }) });
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it("renders error from execution status", () => {
    const errorMessage = "query error: there was an error";
    renderComponent({
      executionStatus: QueryExecutionStatus.Error,
      executionMessage: errorMessage,
    });
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it("renders timeout message from error", () => {
    const errorMessage = "upstream request timeout";
    renderComponent({ gqlError: new ApolloError({ errorMessage }) });
    expect(screen.getByText(/0 rows were selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders timeout message from query status", () => {
    renderComponent({
      executionStatus: QueryExecutionStatus.Timeout,
      rowsLen: 1,
    });
    expect(screen.getByText(/1 row was selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders timeout message from execution message", () => {
    renderComponent({
      executionStatus: QueryExecutionStatus.Error,
      executionMessage: "query error: timeout",
      rowsLen: 3,
    });
    expect(screen.getByText(/3 rows were selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders success message", async () => {
    renderComponent({
      executionStatus: QueryExecutionStatus.Success,
      rowsLen: 1,
    });
    expect(await screen.findByText("master")).toBeVisible();
    expect(screen.getByText("1 row selected")).toBeVisible();
  });
});
