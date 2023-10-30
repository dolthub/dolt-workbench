import {
  ApolloCache,
  ApolloQueryResult,
  InMemoryCache,
  PureQueryOptions,
  RefetchQueriesOptions,
} from "@apollo/client";
import * as gen from "@gen/graphql-types";
import {
  DatabaseParams,
  RefParams,
  RequiredCommitsParams,
  TableParams,
} from "./params";

export type RefetchQueries = Array<string | PureQueryOptions>;

type TCacheShape = ApolloCache<InMemoryCache>;
type RefetchOptions = RefetchQueriesOptions<
  TCacheShape,
  Promise<ApolloQueryResult<any>>
>;

// Refetch tags
export const refetchTagQueries = (
  variables: DatabaseParams,
): RefetchQueries => [
  {
    query: gen.TagListDocument,
    variables,
  },
];

export const refetchBranchQueries = (
  variables: DatabaseParams,
): RefetchQueries => [
  {
    query: gen.DefaultBranchPageQueryDocument,
    variables: { ...variables, filterSystemTables: true },
  },
  { query: gen.BranchesForSelectorDocument, variables },
  // { query: gen.GetBranchForPullDocument, variables },
  { query: gen.BranchListDocument, variables },
];

export const refetchResetChangesQueries = (
  variables: RefParams,
  isDolt = false,
): RefetchQueries => {
  const diffVariables: RequiredCommitsParams = {
    ...variables,
    fromCommitId: "HEAD",
    toCommitId: "WORKING",
  };
  return [
    ...(isDolt ? [{ query: gen.GetStatusDocument, variables }] : []),
    {
      query: gen.DiffStatDocument,
      variables: {
        ...variables,
        fromRefName: diffVariables.fromCommitId,
        toRefName: diffVariables.toCommitId,
      },
    },
    {
      query: gen.DiffSummariesDocument,
      variables: diffVariables,
    },
    {
      query: gen.TableNamesDocument,
      variables: { ...variables, filterSystemTables: true },
    },
  ];
};

export const refetchTableQueries = (variables: TableParams) => [
  { query: gen.DataTableQueryDocument, variables },
  {
    query: gen.RowsForDataTableQueryDocument,
    variables,
  },
];

export const refetchTableUploadQueries = (
  variables: TableParams,
  isDolt = false,
) => [
  ...refetchResetChangesQueries(variables, isDolt),
  ...refetchTableQueries(variables),
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
      "status",
      "diffSummaries",
      "diffStat",
      "rowDiffs",
      "schemaDiff",
      "doltProcedures",
      "doltSchemas",
    ].forEach(fieldName => {
      cache.evict({ fieldName });
    });
    cache.gc();
  },
};
