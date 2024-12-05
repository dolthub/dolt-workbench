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
  PullDiffParams,
  RefOptionalSchemaParams,
  RequiredRefsParams,
  TableOptionalSchemaParams,
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
  variables: RefOptionalSchemaParams,
  isDolt = false,
): RefetchQueries => {
  const diffVariables: RequiredRefsParams = {
    ...variables,
    fromRefName: "HEAD",
    toRefName: "WORKING",
  };
  return [
    ...(isDolt
      ? [
          { query: gen.GetStatusDocument, variables },
          {
            query: gen.DiffStatDocument,
            variables: diffVariables,
          },
          {
            query: gen.DiffSummariesDocument,
            variables: diffVariables,
          },
        ]
      : []),

    {
      query: gen.TableNamesDocument,
      variables: { ...variables, filterSystemTables: true },
    },
  ];
};

export const refetchTableQueries = (variables: TableOptionalSchemaParams) => [
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

export const refetchDeletedBranch = (
  params: PullDiffParams,
): RefetchQueries => [
  {
    query: gen.GetBranchForPullDocument,
    variables: {
      databaseName: params.databaseName,
      branchName: params.fromBranchName,
    },
  },
  {
    query: gen.PullDetailsForPullDetailsDocument,
    variables: params,
  },
  ...refetchBranchQueries(params),
];

export const refetchRemoteQueries = (
  variables: DatabaseParams,
): RefetchQueries => [{ query: gen.RemoteListDocument, variables }];

export const refetchUpdateDatabaseQueriesCacheEvict: RefetchOptions = {
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
      "databases",
      "pullWithDetails",
    ].forEach(fieldName => {
      cache.evict({ fieldName });
    });
    cache.gc();
  },
};
