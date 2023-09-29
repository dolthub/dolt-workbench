import {
  ApolloCache,
  ApolloQueryResult,
  InMemoryCache,
  RefetchQueriesOptions,
} from "@apollo/client";

type TCacheShape = ApolloCache<InMemoryCache>;
type RefetchOptions = RefetchQueriesOptions<
  TCacheShape,
  Promise<ApolloQueryResult<any>>
>;

export const refetchSqlUpdateQueriesCacheEvict: RefetchOptions = {
  updateCache(cache: TCacheShape) {
    [
      "rows",
      "tables",
      "table",
      "tableNames",
      // "branchNames",
      // "views",
      // "docs",
      // "commits",
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
