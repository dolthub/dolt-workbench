import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import {
  QueryExecutionStatus,
  SqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";
import {
  clearPendingSqlResult,
  peekPendingSqlResult,
  setPendingSqlResult,
} from "@lib/pendingSqlResult";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode, StrictMode } from "react";
import useSqlSelectRows from "./useSqlSelectRows";

function makeData(executionMessage: string): SqlSelectForSqlDataTableQuery {
  return {
    __typename: "Query",
    sqlSelect: {
      __typename: "SqlSelect",
      queryExecutionStatus: QueryExecutionStatus.Success,
      queryExecutionMessage: executionMessage,
      isMutation: false,
      warnings: null,
      columns: [],
      rows: { __typename: "RowList", nextOffset: null, list: [] },
    },
  };
}

function makeParams(q: string): SqlQueryParams {
  return { databaseName: "dbname", refName: "main", q };
}

function makeResult(q: string, executionMessage: string) {
  return {
    variables: { databaseName: "dbname", refName: "main", queryString: q },
    data: makeData(executionMessage),
  };
}

describe("useSqlSelectRows", () => {
  let executedQueries: string[];
  let wrapper: (props: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    executedQueries = [];
    const link = new ApolloLink(operation => {
      executedQueries.push(operation.variables.queryString);
      return Observable.of({
        data: makeData(`network: ${operation.variables.queryString}`),
      });
    });
    const client = new ApolloClient({ link, cache: new InMemoryCache() });
    wrapper = ({ children }: { children: ReactNode }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    );
  });

  afterEach(() => {
    clearPendingSqlResult();
  });

  it("renders a pending result without executing the query", async () => {
    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "1 row added"));
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("INSERT INTO t VALUES (1)") },
      wrapper,
    });
    expect(result.current.state.executionMessage).toBe("1 row added");
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());
    expect(executedQueries).toHaveLength(0);
  });

  it("does not re-execute the current query when a result for the next url arrives before navigation", async () => {
    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "1 row added"));
    const { result, rerender } = renderHook(
      ({ params }) => useSqlSelectRows(params),
      {
        initialProps: { params: makeParams("INSERT INTO t VALUES (1)") },
        wrapper,
      },
    );
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());

    act(() => {
      setPendingSqlResult(makeResult("SELECT 1", "1 row selected"));
    });
    expect(executedQueries).toHaveLength(0);
    expect(result.current.state.executionMessage).toBe("1 row added");

    rerender({ params: makeParams("SELECT 1") });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("1 row selected"),
    );
    expect(executedQueries).toHaveLength(0);
  });

  it("executes the query when there is no pending result", async () => {
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("SELECT * FROM t") },
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe(
        "network: SELECT * FROM t",
      ),
    );
    expect(executedQueries).toEqual(["SELECT * FROM t"]);
  });

  it("executes the query when the pending result is for a different url, and leaves that result for its own page", async () => {
    const pkg = makeResult("SELECT 1", "1 row selected");
    setPendingSqlResult(pkg);
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("SELECT 2") },
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("network: SELECT 2"),
    );
    expect(executedQueries).toEqual(["SELECT 2"]);
    expect(peekPendingSqlResult()).toBe(pkg);
  });

  it("never executes across a chain of consecutive console runs", async () => {
    setPendingSqlResult(makeResult("CREATE TABLE t (v INT)", "created"));
    const { result, rerender } = renderHook(
      ({ params }) => useSqlSelectRows(params),
      {
        initialProps: { params: makeParams("CREATE TABLE t (v INT)") },
        wrapper,
      },
    );
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());

    act(() => {
      setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "added"));
    });
    rerender({ params: makeParams("INSERT INTO t VALUES (1)") });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("added"),
    );

    act(() => {
      setPendingSqlResult(makeResult("SELECT 1", "selected"));
    });
    rerender({ params: makeParams("SELECT 1") });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("selected"),
    );

    expect(executedQueries).toEqual([]);
  });

  it("shows fresh data without executing when the same query is run again from the results page", async () => {
    setPendingSqlResult(makeResult("SELECT 1", "first run"));
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("SELECT 1") },
      wrapper,
    });
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());
    expect(result.current.state.executionMessage).toBe("first run");

    act(() => {
      setPendingSqlResult(makeResult("SELECT 1", "second run"));
    });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("second run"),
    );
    expect(executedQueries).toEqual([]);
  });

  it("only ever executes the current url's query on back and forward navigation", async () => {
    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "added"));
    const { result, rerender } = renderHook(
      ({ params }) => useSqlSelectRows(params),
      {
        initialProps: { params: makeParams("INSERT INTO t VALUES (1)") },
        wrapper,
      },
    );
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());

    rerender({ params: makeParams("SELECT 1") });
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe("network: SELECT 1"),
    );

    rerender({ params: makeParams("INSERT INTO t VALUES (1)") });
    expect(result.current.state.executionMessage).toBe("added");

    expect(executedQueries).toEqual(["SELECT 1"]);
  });

  it("does not execute or re-adopt on repeated renders of the same url", async () => {
    setPendingSqlResult(makeResult("SELECT 1", "1 row selected"));
    const { result, rerender } = renderHook(
      ({ params }) => useSqlSelectRows(params),
      { initialProps: { params: makeParams("SELECT 1") }, wrapper },
    );
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());

    for (let i = 0; i < 5; i++) {
      rerender({ params: makeParams("SELECT 1") });
    }
    expect(result.current.state.executionMessage).toBe("1 row selected");
    expect(executedQueries).toEqual([]);
  });

  it("does not destroy a newer pending result when adopting an older one", async () => {
    setPendingSqlResult(makeResult("SELECT 1", "first"));
    const { rerender } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("SELECT 1") },
      wrapper,
    });
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());

    const newer = makeResult("SELECT 2", "second");
    act(() => {
      setPendingSqlResult(newer);
    });
    for (let i = 0; i < 3; i++) {
      rerender({ params: makeParams("SELECT 1") });
    }
    expect(peekPendingSqlResult()).toBe(newer);
    expect(executedQueries).toEqual([]);
  });

  it("keeps a pending result deposited while unmounted for the next mount", async () => {
    const { unmount } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("SELECT 1") },
      wrapper,
    });
    await waitFor(() => expect(executedQueries).toEqual(["SELECT 1"]));
    unmount();

    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "added"));
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("INSERT INTO t VALUES (1)") },
      wrapper,
    });
    expect(result.current.state.executionMessage).toBe("added");
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());
    expect(executedQueries).toEqual(["SELECT 1"]);
  });

  it("forceNetworkRun executes even when a matching pending result exists", async () => {
    const insertQ = "INSERT INTO t VALUES (1)";
    setPendingSqlResult(makeResult(insertQ, "stranded deposit"));
    const { result } = renderHook(
      ({ params }) => useSqlSelectRows(params, true),
      { initialProps: { params: makeParams(insertQ) }, wrapper },
    );
    await waitFor(() =>
      expect(result.current.state.executionMessage).toBe(`network: ${insertQ}`),
    );
    expect(executedQueries).toEqual([insertQ]);
  });

  it("matches a handoff when the page coerces an absent schemaName to an empty string", async () => {
    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "added"));
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: {
        params: { ...makeParams("INSERT INTO t VALUES (1)"), schemaName: "" },
      },
      wrapper,
    });
    expect(result.current.state.executionMessage).toBe("added");
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());
    expect(executedQueries).toEqual([]);
  });

  it("does not execute a handed-off query under StrictMode double rendering", async () => {
    setPendingSqlResult(makeResult("INSERT INTO t VALUES (1)", "added"));
    const strictWrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{wrapper({ children })}</StrictMode>
    );
    const { result } = renderHook(({ params }) => useSqlSelectRows(params), {
      initialProps: { params: makeParams("INSERT INTO t VALUES (1)") },
      wrapper: strictWrapper,
    });
    expect(result.current.state.executionMessage).toBe("added");
    await waitFor(() => expect(peekPendingSqlResult()).toBeUndefined());
    expect(executedQueries).toEqual([]);
  });
});
