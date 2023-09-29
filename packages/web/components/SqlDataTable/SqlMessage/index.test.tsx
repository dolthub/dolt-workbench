import { ApolloError } from "@apollo/client";
import { QueryExecutionStatus } from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";
import { render, screen } from "@testing-library/react";
import SqlMessage from ".";

const params: SqlQueryParams = {
  refName: "master",
  q: "SELECT * FROM tablename",
};

describe("test SqlMessage", () => {
  it("renders error", () => {
    const errorMessage = "this is an error";
    render(
      <SqlMessage
        params={params}
        rowsLen={0}
        gqlError={new ApolloError({ errorMessage })}
      />,
    );
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it("renders error from execution status", () => {
    const errorMessage = "query error: there was an error";
    render(
      <SqlMessage
        params={params}
        rowsLen={0}
        executionStatus={QueryExecutionStatus.Error}
        executionMessage={errorMessage}
      />,
    );
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it("renders timeout message from error", () => {
    const errorMessage = "upstream request timeout";
    render(
      <SqlMessage
        params={params}
        rowsLen={0}
        gqlError={new ApolloError({ errorMessage })}
      />,
    );
    expect(screen.getByText(/0 rows were selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders timeout message from query status", () => {
    render(
      <SqlMessage
        params={params}
        rowsLen={1}
        executionStatus={QueryExecutionStatus.Timeout}
      />,
    );
    expect(screen.getByText(/1 row was selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders timeout message from execution message", () => {
    render(
      <SqlMessage
        params={params}
        rowsLen={3}
        executionStatus={QueryExecutionStatus.Error}
        executionMessage="query error: timeout"
      />,
    );
    expect(screen.getByText(/3 rows were selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(screen.getByText(/before query timed out./)).toBeVisible();
  });

  it("renders success message", () => {
    render(
      <SqlMessage
        params={params}
        rowsLen={1}
        executionStatus={QueryExecutionStatus.Success}
      />,
    );
    expect(screen.getByText("1 row selected on")).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
  });

  it("renders row limit message", () => {
    render(
      <SqlMessage
        params={params}
        rowsLen={200}
        executionStatus={QueryExecutionStatus.RowLimit}
      />,
    );
    expect(screen.getByText(/200 rows selected on/)).toBeVisible();
    expect(screen.getByText("master")).toBeVisible();
    expect(
      screen.getByText(/\(for unlimited query results download /),
    ).toBeVisible();
  });
});
