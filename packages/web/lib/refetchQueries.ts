import {
  ApolloCache,
  ApolloQueryResult,
  InMemoryCache,
  PureQueryOptions,
  RefetchQueriesOptions,
} from "@apollo/client";
import * as gen from "@gen/graphql-types";
import { DatabaseParams } from "./params";

export type RefetchQueries = Array<string | PureQueryOptions>;

type TCacheShape = ApolloCache<InMemoryCache>;
type RefetchOptions = RefetchQueriesOptions<
  TCacheShape,
  Promise<ApolloQueryResult<any>>
>;

export const refetchBranchQueries = (
  variables: DatabaseParams,
): RefetchQueries => [
  {
    query: gen.DefaultBranchPageQueryDocument,
    variables: { ...variables, filterSystemTables: true },
  },
  // { query: gen.BranchesForSelectorDocument, variables },
  // { query: gen.GetBranchForPullDocument, variables },
  { query: gen.BranchListDocument, variables },
];

export const refetchSqlUpdateQueriesCacheEvict: RefetchOptions = {
  updateCache(cache: TCacheShape) {
    [
      "rows",
      "tables",
      "table",
      "tableNames",
      "currentDatabase",
      "branchNames",
      "views",
      "docs",
      "commits",
      // "status",
      // "diffSummaries",
      // "diffStat",
      // "rowDiffs",
      // "schemaDiff",
    ].forEach(fieldName => {
      cache.evict({ fieldName });
    });
    cache.gc();
  },
};
