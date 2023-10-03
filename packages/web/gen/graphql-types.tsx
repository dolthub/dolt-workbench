import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ColConstraint = {
  __typename?: 'ColConstraint';
  notNull: Scalars['Boolean']['output'];
};

export type Column = {
  __typename?: 'Column';
  constraints?: Maybe<Array<ColConstraint>>;
  isPrimaryKey: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ColumnValue = {
  __typename?: 'ColumnValue';
  displayValue: Scalars['String']['output'];
};

export type ForeignKey = {
  __typename?: 'ForeignKey';
  columnName: Scalars['String']['output'];
  foreignKeyColumn: Array<ForeignKeyColumn>;
  referencedTableName: Scalars['String']['output'];
  tableName: Scalars['String']['output'];
};

export type ForeignKeyColumn = {
  __typename?: 'ForeignKeyColumn';
  referencedColumnName: Scalars['String']['output'];
  referrerColumnIndex: Scalars['Float']['output'];
};

export type Index = {
  __typename?: 'Index';
  columns: Array<IndexColumn>;
  comment: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type IndexColumn = {
  __typename?: 'IndexColumn';
  name: Scalars['String']['output'];
  sqlType?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addDatabaseConnection: Scalars['String']['output'];
};


export type MutationAddDatabaseConnectionArgs = {
  url?: InputMaybe<Scalars['String']['input']>;
  useEnv?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Query = {
  __typename?: 'Query';
  currentDatabase?: Maybe<Scalars['String']['output']>;
  databases: Array<Scalars['String']['output']>;
  hasDatabaseEnv: Scalars['Boolean']['output'];
  rows: RowList;
  sqlSelect: SqlSelect;
  table: Table;
  tableNames: TableNames;
  tables: Array<Table>;
};


export type QueryRowsArgs = {
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  tableName: Scalars['String']['input'];
};


export type QuerySqlSelectArgs = {
  databaseName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
};


export type QueryTableArgs = {
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type QueryTableNamesArgs = {
  databaseName: Scalars['String']['input'];
};


export type QueryTablesArgs = {
  databaseName: Scalars['String']['input'];
};

export enum QueryExecutionStatus {
  Error = 'Error',
  RowLimit = 'RowLimit',
  Success = 'Success',
  Timeout = 'Timeout'
}

export type Row = {
  __typename?: 'Row';
  columnValues: Array<ColumnValue>;
};

export type RowList = {
  __typename?: 'RowList';
  list: Array<Row>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

export type SqlSelect = {
  __typename?: 'SqlSelect';
  _id: Scalars['ID']['output'];
  columns: Array<Column>;
  databaseName: Scalars['String']['output'];
  queryExecutionMessage: Scalars['String']['output'];
  queryExecutionStatus: QueryExecutionStatus;
  queryString: Scalars['String']['output'];
  rows: Array<Row>;
};

export type Table = {
  __typename?: 'Table';
  _id: Scalars['ID']['output'];
  columns: Array<Column>;
  databaseName: Scalars['String']['output'];
  foreignKeys: Array<ForeignKey>;
  indexes: Array<Index>;
  tableName: Scalars['String']['output'];
};

export type TableNames = {
  __typename?: 'TableNames';
  list: Array<Scalars['String']['output']>;
};

export type CurrentDatabaseQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentDatabaseQuery = { __typename?: 'Query', currentDatabase?: string | null };

export type ColumnsListForTableListFragment = { __typename?: 'IndexColumn', name: string, sqlType?: string | null };

export type IndexForTableListFragment = { __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> };

export type TableForSchemaListFragment = { __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> };

export type TableListForSchemasQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type TableListForSchemasQuery = { __typename?: 'Query', tables: Array<{ __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> }> };

export type RowForSqlDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type ColumnForSqlDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string };

export type SqlSelectForSqlDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForSqlDataTableQuery = { __typename?: 'Query', sqlSelect: { __typename?: 'SqlSelect', _id: string, queryExecutionStatus: QueryExecutionStatus, queryExecutionMessage: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string }>, rows: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type ColumnForTableListFragment = { __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type TableWithColumnsFragment = { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> };

export type TableForBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type TableForBranchQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> } };

export type AddDatabaseConnectionMutationVariables = Exact<{
  url?: InputMaybe<Scalars['String']['input']>;
  useEnv?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AddDatabaseConnectionMutation = { __typename?: 'Mutation', addDatabaseConnection: string };

export type HasDatabaseEnvQueryVariables = Exact<{ [key: string]: never; }>;


export type HasDatabaseEnvQuery = { __typename?: 'Query', hasDatabaseEnv: boolean };

export type ColumnForDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type ForeignKeyColumnForDataTableFragment = { __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number };

export type ForeignKeysForDataTableFragment = { __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> };

export type DataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type DataTableQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }> } };

export type RowForDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowListRowsFragment = { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> };

export type RowsForDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RowsForDataTableQuery = { __typename?: 'Query', rows: { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type TableNamesQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type TableNamesQuery = { __typename?: 'Query', tableNames: { __typename?: 'TableNames', list: Array<string> } };

export const ForeignKeyColumnForDataTableFragmentDoc = gql`
    fragment ForeignKeyColumnForDataTable on ForeignKeyColumn {
  referencedColumnName
  referrerColumnIndex
}
    `;
export const ForeignKeysForDataTableFragmentDoc = gql`
    fragment ForeignKeysForDataTable on ForeignKey {
  tableName
  columnName
  referencedTableName
  foreignKeyColumn {
    ...ForeignKeyColumnForDataTable
  }
}
    ${ForeignKeyColumnForDataTableFragmentDoc}`;
export const ColumnForTableListFragmentDoc = gql`
    fragment ColumnForTableList on Column {
  name
  type
  isPrimaryKey
  constraints {
    notNull
  }
}
    `;
export const ColumnsListForTableListFragmentDoc = gql`
    fragment ColumnsListForTableList on IndexColumn {
  name
  sqlType
}
    `;
export const IndexForTableListFragmentDoc = gql`
    fragment IndexForTableList on Index {
  name
  type
  comment
  columns {
    ...ColumnsListForTableList
  }
}
    ${ColumnsListForTableListFragmentDoc}`;
export const TableForSchemaListFragmentDoc = gql`
    fragment TableForSchemaList on Table {
  _id
  tableName
  foreignKeys {
    ...ForeignKeysForDataTable
  }
  columns {
    ...ColumnForTableList
  }
  indexes {
    ...IndexForTableList
  }
}
    ${ForeignKeysForDataTableFragmentDoc}
${ColumnForTableListFragmentDoc}
${IndexForTableListFragmentDoc}`;
export const RowForSqlDataTableFragmentDoc = gql`
    fragment RowForSqlDataTable on Row {
  columnValues {
    displayValue
  }
}
    `;
export const ColumnForSqlDataTableFragmentDoc = gql`
    fragment ColumnForSqlDataTable on Column {
  name
  isPrimaryKey
  type
}
    `;
export const TableWithColumnsFragmentDoc = gql`
    fragment TableWithColumns on Table {
  _id
  tableName
  columns {
    ...ColumnForTableList
  }
}
    ${ColumnForTableListFragmentDoc}`;
export const ColumnForDataTableFragmentDoc = gql`
    fragment ColumnForDataTable on Column {
  name
  isPrimaryKey
  type
  constraints {
    notNull
  }
}
    `;
export const RowForDataTableFragmentDoc = gql`
    fragment RowForDataTable on Row {
  columnValues {
    displayValue
  }
}
    `;
export const RowListRowsFragmentDoc = gql`
    fragment RowListRows on RowList {
  nextOffset
  list {
    ...RowForDataTable
  }
}
    ${RowForDataTableFragmentDoc}`;
export const CurrentDatabaseDocument = gql`
    query CurrentDatabase {
  currentDatabase
}
    `;

/**
 * __useCurrentDatabaseQuery__
 *
 * To run a query within a React component, call `useCurrentDatabaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentDatabaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentDatabaseQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentDatabaseQuery(baseOptions?: Apollo.QueryHookOptions<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>(CurrentDatabaseDocument, options);
      }
export function useCurrentDatabaseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>(CurrentDatabaseDocument, options);
        }
export type CurrentDatabaseQueryHookResult = ReturnType<typeof useCurrentDatabaseQuery>;
export type CurrentDatabaseLazyQueryHookResult = ReturnType<typeof useCurrentDatabaseLazyQuery>;
export type CurrentDatabaseQueryResult = Apollo.QueryResult<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>;
export const TableListForSchemasDocument = gql`
    query TableListForSchemas($databaseName: String!) {
  tables(databaseName: $databaseName) {
    ...TableForSchemaList
  }
}
    ${TableForSchemaListFragmentDoc}`;

/**
 * __useTableListForSchemasQuery__
 *
 * To run a query within a React component, call `useTableListForSchemasQuery` and pass it any options that fit your needs.
 * When your component renders, `useTableListForSchemasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTableListForSchemasQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useTableListForSchemasQuery(baseOptions: Apollo.QueryHookOptions<TableListForSchemasQuery, TableListForSchemasQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableListForSchemasQuery, TableListForSchemasQueryVariables>(TableListForSchemasDocument, options);
      }
export function useTableListForSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableListForSchemasQuery, TableListForSchemasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableListForSchemasQuery, TableListForSchemasQueryVariables>(TableListForSchemasDocument, options);
        }
export type TableListForSchemasQueryHookResult = ReturnType<typeof useTableListForSchemasQuery>;
export type TableListForSchemasLazyQueryHookResult = ReturnType<typeof useTableListForSchemasLazyQuery>;
export type TableListForSchemasQueryResult = Apollo.QueryResult<TableListForSchemasQuery, TableListForSchemasQueryVariables>;
export const SqlSelectForSqlDataTableDocument = gql`
    query SqlSelectForSqlDataTable($databaseName: String!, $queryString: String!) {
  sqlSelect(databaseName: $databaseName, queryString: $queryString) {
    _id
    queryExecutionStatus
    queryExecutionMessage
    columns {
      ...ColumnForSqlDataTable
    }
    rows {
      ...RowForSqlDataTable
    }
  }
}
    ${ColumnForSqlDataTableFragmentDoc}
${RowForSqlDataTableFragmentDoc}`;

/**
 * __useSqlSelectForSqlDataTableQuery__
 *
 * To run a query within a React component, call `useSqlSelectForSqlDataTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useSqlSelectForSqlDataTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSqlSelectForSqlDataTableQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      queryString: // value for 'queryString'
 *   },
 * });
 */
export function useSqlSelectForSqlDataTableQuery(baseOptions: Apollo.QueryHookOptions<SqlSelectForSqlDataTableQuery, SqlSelectForSqlDataTableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SqlSelectForSqlDataTableQuery, SqlSelectForSqlDataTableQueryVariables>(SqlSelectForSqlDataTableDocument, options);
      }
export function useSqlSelectForSqlDataTableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SqlSelectForSqlDataTableQuery, SqlSelectForSqlDataTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SqlSelectForSqlDataTableQuery, SqlSelectForSqlDataTableQueryVariables>(SqlSelectForSqlDataTableDocument, options);
        }
export type SqlSelectForSqlDataTableQueryHookResult = ReturnType<typeof useSqlSelectForSqlDataTableQuery>;
export type SqlSelectForSqlDataTableLazyQueryHookResult = ReturnType<typeof useSqlSelectForSqlDataTableLazyQuery>;
export type SqlSelectForSqlDataTableQueryResult = Apollo.QueryResult<SqlSelectForSqlDataTableQuery, SqlSelectForSqlDataTableQueryVariables>;
export const TableForBranchDocument = gql`
    query TableForBranch($databaseName: String!, $tableName: String!) {
  table(databaseName: $databaseName, tableName: $tableName) {
    ...TableWithColumns
  }
}
    ${TableWithColumnsFragmentDoc}`;

/**
 * __useTableForBranchQuery__
 *
 * To run a query within a React component, call `useTableForBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useTableForBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTableForBranchQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *   },
 * });
 */
export function useTableForBranchQuery(baseOptions: Apollo.QueryHookOptions<TableForBranchQuery, TableForBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableForBranchQuery, TableForBranchQueryVariables>(TableForBranchDocument, options);
      }
export function useTableForBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableForBranchQuery, TableForBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableForBranchQuery, TableForBranchQueryVariables>(TableForBranchDocument, options);
        }
export type TableForBranchQueryHookResult = ReturnType<typeof useTableForBranchQuery>;
export type TableForBranchLazyQueryHookResult = ReturnType<typeof useTableForBranchLazyQuery>;
export type TableForBranchQueryResult = Apollo.QueryResult<TableForBranchQuery, TableForBranchQueryVariables>;
export const AddDatabaseConnectionDocument = gql`
    mutation AddDatabaseConnection($url: String, $useEnv: Boolean) {
  addDatabaseConnection(url: $url, useEnv: $useEnv)
}
    `;
export type AddDatabaseConnectionMutationFn = Apollo.MutationFunction<AddDatabaseConnectionMutation, AddDatabaseConnectionMutationVariables>;

/**
 * __useAddDatabaseConnectionMutation__
 *
 * To run a mutation, you first call `useAddDatabaseConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDatabaseConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDatabaseConnectionMutation, { data, loading, error }] = useAddDatabaseConnectionMutation({
 *   variables: {
 *      url: // value for 'url'
 *      useEnv: // value for 'useEnv'
 *   },
 * });
 */
export function useAddDatabaseConnectionMutation(baseOptions?: Apollo.MutationHookOptions<AddDatabaseConnectionMutation, AddDatabaseConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddDatabaseConnectionMutation, AddDatabaseConnectionMutationVariables>(AddDatabaseConnectionDocument, options);
      }
export type AddDatabaseConnectionMutationHookResult = ReturnType<typeof useAddDatabaseConnectionMutation>;
export type AddDatabaseConnectionMutationResult = Apollo.MutationResult<AddDatabaseConnectionMutation>;
export type AddDatabaseConnectionMutationOptions = Apollo.BaseMutationOptions<AddDatabaseConnectionMutation, AddDatabaseConnectionMutationVariables>;
export const HasDatabaseEnvDocument = gql`
    query HasDatabaseEnv {
  hasDatabaseEnv
}
    `;

/**
 * __useHasDatabaseEnvQuery__
 *
 * To run a query within a React component, call `useHasDatabaseEnvQuery` and pass it any options that fit your needs.
 * When your component renders, `useHasDatabaseEnvQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHasDatabaseEnvQuery({
 *   variables: {
 *   },
 * });
 */
export function useHasDatabaseEnvQuery(baseOptions?: Apollo.QueryHookOptions<HasDatabaseEnvQuery, HasDatabaseEnvQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HasDatabaseEnvQuery, HasDatabaseEnvQueryVariables>(HasDatabaseEnvDocument, options);
      }
export function useHasDatabaseEnvLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HasDatabaseEnvQuery, HasDatabaseEnvQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HasDatabaseEnvQuery, HasDatabaseEnvQueryVariables>(HasDatabaseEnvDocument, options);
        }
export type HasDatabaseEnvQueryHookResult = ReturnType<typeof useHasDatabaseEnvQuery>;
export type HasDatabaseEnvLazyQueryHookResult = ReturnType<typeof useHasDatabaseEnvLazyQuery>;
export type HasDatabaseEnvQueryResult = Apollo.QueryResult<HasDatabaseEnvQuery, HasDatabaseEnvQueryVariables>;
export const DataTableQueryDocument = gql`
    query DataTableQuery($databaseName: String!, $tableName: String!) {
  table(databaseName: $databaseName, tableName: $tableName) {
    _id
    columns {
      ...ColumnForDataTable
    }
    foreignKeys {
      ...ForeignKeysForDataTable
    }
  }
}
    ${ColumnForDataTableFragmentDoc}
${ForeignKeysForDataTableFragmentDoc}`;

/**
 * __useDataTableQuery__
 *
 * To run a query within a React component, call `useDataTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useDataTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDataTableQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *   },
 * });
 */
export function useDataTableQuery(baseOptions: Apollo.QueryHookOptions<DataTableQuery, DataTableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DataTableQuery, DataTableQueryVariables>(DataTableQueryDocument, options);
      }
export function useDataTableQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DataTableQuery, DataTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DataTableQuery, DataTableQueryVariables>(DataTableQueryDocument, options);
        }
export type DataTableQueryHookResult = ReturnType<typeof useDataTableQuery>;
export type DataTableQueryLazyQueryHookResult = ReturnType<typeof useDataTableQueryLazyQuery>;
export type DataTableQueryQueryResult = Apollo.QueryResult<DataTableQuery, DataTableQueryVariables>;
export const RowsForDataTableQueryDocument = gql`
    query RowsForDataTableQuery($databaseName: String!, $tableName: String!, $offset: Int) {
  rows(databaseName: $databaseName, tableName: $tableName, offset: $offset) {
    ...RowListRows
  }
}
    ${RowListRowsFragmentDoc}`;

/**
 * __useRowsForDataTableQuery__
 *
 * To run a query within a React component, call `useRowsForDataTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useRowsForDataTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRowsForDataTableQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useRowsForDataTableQuery(baseOptions: Apollo.QueryHookOptions<RowsForDataTableQuery, RowsForDataTableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDataTableQuery, RowsForDataTableQueryVariables>(RowsForDataTableQueryDocument, options);
      }
export function useRowsForDataTableQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDataTableQuery, RowsForDataTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDataTableQuery, RowsForDataTableQueryVariables>(RowsForDataTableQueryDocument, options);
        }
export type RowsForDataTableQueryHookResult = ReturnType<typeof useRowsForDataTableQuery>;
export type RowsForDataTableQueryLazyQueryHookResult = ReturnType<typeof useRowsForDataTableQueryLazyQuery>;
export type RowsForDataTableQueryQueryResult = Apollo.QueryResult<RowsForDataTableQuery, RowsForDataTableQueryVariables>;
export const TableNamesDocument = gql`
    query TableNames($databaseName: String!) {
  tableNames(databaseName: $databaseName) {
    list
  }
}
    `;

/**
 * __useTableNamesQuery__
 *
 * To run a query within a React component, call `useTableNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTableNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTableNamesQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useTableNamesQuery(baseOptions: Apollo.QueryHookOptions<TableNamesQuery, TableNamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableNamesQuery, TableNamesQueryVariables>(TableNamesDocument, options);
      }
export function useTableNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableNamesQuery, TableNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableNamesQuery, TableNamesQueryVariables>(TableNamesDocument, options);
        }
export type TableNamesQueryHookResult = ReturnType<typeof useTableNamesQuery>;
export type TableNamesLazyQueryHookResult = ReturnType<typeof useTableNamesLazyQuery>;
export type TableNamesQueryResult = Apollo.QueryResult<TableNamesQuery, TableNamesQueryVariables>;