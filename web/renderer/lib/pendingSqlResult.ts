import {
  SqlSelectForSqlDataTableQuery,
  SqlSelectForSqlDataTableQueryVariables,
} from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";

export type PendingSqlResult = {
  variables: SqlSelectForSqlDataTableQueryVariables;
  data: SqlSelectForSqlDataTableQuery;
};

let pending: PendingSqlResult | undefined;
const subscribers = new Set<() => void>();

export function setPendingSqlResult(result: PendingSqlResult): void {
  pending = result;
  subscribers.forEach(notify => notify());
}

export function peekPendingSqlResult(): PendingSqlResult | undefined {
  return pending;
}

export function clearPendingSqlResult(): void {
  pending = undefined;
}

export function subscribePendingSqlResult(onSet: () => void): () => void {
  subscribers.add(onSet);
  return () => {
    subscribers.delete(onSet);
  };
}

export function pendingSqlResultMatches(
  result: PendingSqlResult,
  params: SqlQueryParams,
): boolean {
  return (
    result.variables.databaseName === params.databaseName &&
    result.variables.refName === params.refName &&
    result.variables.queryString === params.q &&
    (result.variables.schemaName || undefined) ===
      (params.schemaName || undefined)
  );
}
