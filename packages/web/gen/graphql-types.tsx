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
  Timestamp: { input: any; output: any; }
};

export type Branch = {
  __typename?: 'Branch';
  _id: Scalars['ID']['output'];
  branchName: Scalars['String']['output'];
  databaseName: Scalars['String']['output'];
  head?: Maybe<Scalars['String']['output']>;
  lastCommitter: Scalars['String']['output'];
  lastUpdated: Scalars['Timestamp']['output'];
  table?: Maybe<Table>;
  tableNames: Array<Scalars['String']['output']>;
};


export type BranchTableArgs = {
  tableName: Scalars['String']['input'];
};


export type BranchTableNamesArgs = {
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BranchNamesList = {
  __typename?: 'BranchNamesList';
  list: Array<Branch>;
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

export type Commit = {
  __typename?: 'Commit';
  _id: Scalars['ID']['output'];
  commitId: Scalars['String']['output'];
  committedAt: Scalars['Timestamp']['output'];
  committer: DoltWriter;
  databaseName: Scalars['String']['output'];
  message: Scalars['String']['output'];
  parents: Array<Scalars['String']['output']>;
};

export type CommitList = {
  __typename?: 'CommitList';
  list: Array<Commit>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

export type DoltDatabaseDetails = {
  __typename?: 'DoltDatabaseDetails';
  hideDoltFeatures: Scalars['Boolean']['output'];
  isDolt: Scalars['Boolean']['output'];
};

export type DoltWriter = {
  __typename?: 'DoltWriter';
  _id: Scalars['ID']['output'];
  displayName: Scalars['String']['output'];
  emailAddress: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
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
  createBranch: Branch;
  createDatabase: Scalars['Boolean']['output'];
  deleteBranch: Scalars['Boolean']['output'];
};


export type MutationAddDatabaseConnectionArgs = {
  url?: InputMaybe<Scalars['String']['input']>;
  useEnv?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateBranchArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  newBranchName: Scalars['String']['input'];
};


export type MutationCreateDatabaseArgs = {
  databaseName: Scalars['String']['input'];
};


export type MutationDeleteBranchArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  branch?: Maybe<Branch>;
  branchOrDefault?: Maybe<Branch>;
  branches: BranchNamesList;
  commits: CommitList;
  currentDatabase?: Maybe<Scalars['String']['output']>;
  databases: Array<Scalars['String']['output']>;
  defaultBranch?: Maybe<Branch>;
  doltDatabaseDetails: DoltDatabaseDetails;
  hasDatabaseEnv: Scalars['Boolean']['output'];
  rows: RowList;
  sqlSelect: SqlSelect;
  sqlSelectForCsvDownload: Scalars['String']['output'];
  table: Table;
  tableNames: TableNames;
  tables: Array<Table>;
  tags: TagList;
  views: RowList;
};


export type QueryBranchArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
};


export type QueryBranchOrDefaultArgs = {
  branchName?: InputMaybe<Scalars['String']['input']>;
  databaseName: Scalars['String']['input'];
};


export type QueryBranchesArgs = {
  databaseName: Scalars['String']['input'];
  sortBy?: InputMaybe<SortBranchesBy>;
};


export type QueryCommitsArgs = {
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName: Scalars['String']['input'];
};


export type QueryDefaultBranchArgs = {
  databaseName: Scalars['String']['input'];
};


export type QueryRowsArgs = {
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type QuerySqlSelectArgs = {
  databaseName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QuerySqlSelectForCsvDownloadArgs = {
  databaseName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryTableArgs = {
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type QueryTableNamesArgs = {
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
  refName: Scalars['String']['input'];
};


export type QueryTablesArgs = {
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
  refName: Scalars['String']['input'];
};


export type QueryTagsArgs = {
  databaseName: Scalars['String']['input'];
};


export type QueryViewsArgs = {
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
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

export enum SortBranchesBy {
  LastUpdated = 'LastUpdated',
  Unspecified = 'Unspecified'
}

export type SqlSelect = {
  __typename?: 'SqlSelect';
  _id: Scalars['ID']['output'];
  columns: Array<Column>;
  databaseName: Scalars['String']['output'];
  queryExecutionMessage: Scalars['String']['output'];
  queryExecutionStatus: QueryExecutionStatus;
  queryString: Scalars['String']['output'];
  refName: Scalars['String']['output'];
  rows: Array<Row>;
};

export type Table = {
  __typename?: 'Table';
  _id: Scalars['ID']['output'];
  columns: Array<Column>;
  databaseName: Scalars['String']['output'];
  foreignKeys: Array<ForeignKey>;
  indexes: Array<Index>;
  refName: Scalars['String']['output'];
  tableName: Scalars['String']['output'];
};

export type TableNames = {
  __typename?: 'TableNames';
  list: Array<Scalars['String']['output']>;
};

export type Tag = {
  __typename?: 'Tag';
  _id: Scalars['ID']['output'];
  commitId: Scalars['String']['output'];
  databaseName: Scalars['String']['output'];
  message: Scalars['String']['output'];
  tagName: Scalars['String']['output'];
  taggedAt: Scalars['Timestamp']['output'];
  tagger: DoltWriter;
};

export type TagList = {
  __typename?: 'TagList';
  list: Array<Tag>;
};

export type CreateDatabaseMutationVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type CreateDatabaseMutation = { __typename?: 'Mutation', createDatabase: boolean };

export type BranchForBranchSelectorFragment = { __typename?: 'Branch', branchName: string, databaseName: string };

export type BranchesForSelectorQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type BranchesForSelectorQuery = { __typename?: 'Query', branches: { __typename?: 'BranchNamesList', list: Array<{ __typename?: 'Branch', branchName: string, databaseName: string }> } };

export type TagForListFragment = { __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } };

export type TagListForTagListFragment = { __typename?: 'TagList', list: Array<{ __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> };

export type TagListQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type TagListQuery = { __typename?: 'Query', tags: { __typename?: 'TagList', list: Array<{ __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> } };

export type CurrentDatabaseQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentDatabaseQuery = { __typename?: 'Query', currentDatabase?: string | null };

export type SqlSelectForCsvDownloadQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForCsvDownloadQuery = { __typename?: 'Query', sqlSelectForCsvDownload: string };

export type DatabasesQueryVariables = Exact<{ [key: string]: never; }>;


export type DatabasesQuery = { __typename?: 'Query', databases: Array<string> };

export type ColumnsListForTableListFragment = { __typename?: 'IndexColumn', name: string, sqlType?: string | null };

export type IndexForTableListFragment = { __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> };

export type TableForSchemaListFragment = { __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> };

export type TableListForSchemasQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type TableListForSchemasQuery = { __typename?: 'Query', tables: Array<{ __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> }> };

export type RowForSqlDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type ColumnForSqlDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string };

export type SqlSelectForSqlDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForSqlDataTableQuery = { __typename?: 'Query', sqlSelect: { __typename?: 'SqlSelect', _id: string, queryExecutionStatus: QueryExecutionStatus, queryExecutionMessage: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string }>, rows: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type ColumnForTableListFragment = { __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type TableWithColumnsFragment = { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> };

export type TableForBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type TableForBranchQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> } };

export type RowForViewsFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowsForViewsQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type RowsForViewsQuery = { __typename?: 'Query', views: { __typename?: 'RowList', list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type BranchFragment = { __typename?: 'Branch', _id: string, branchName: string, databaseName: string, lastUpdated: any, lastCommitter: string };

export type BranchListQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  sortBy?: InputMaybe<SortBranchesBy>;
}>;


export type BranchListQuery = { __typename?: 'Query', branches: { __typename?: 'BranchNamesList', list: Array<{ __typename?: 'Branch', _id: string, branchName: string, databaseName: string, lastUpdated: any, lastCommitter: string }> } };

export type DeleteBranchMutationVariables = Exact<{
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type DeleteBranchMutation = { __typename?: 'Mutation', deleteBranch: boolean };

export type BranchForCreateBranchFragment = { __typename?: 'Branch', databaseName: string, branchName: string };

export type CreateBranchMutationVariables = Exact<{
  newBranchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
}>;


export type CreateBranchMutation = { __typename?: 'Mutation', createBranch: { __typename?: 'Branch', databaseName: string, branchName: string } };

export type DefaultBranchPageQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DefaultBranchPageQuery = { __typename?: 'Query', defaultBranch?: { __typename?: 'Branch', _id: string, branchName: string, tableNames: Array<string> } | null };

export type RefPageQueryVariables = Exact<{
  refName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RefPageQuery = { __typename?: 'Query', branch?: { __typename?: 'Branch', _id: string } | null, tableNames: { __typename?: 'TableNames', list: Array<string> } };

export type AddDatabaseConnectionMutationVariables = Exact<{
  url?: InputMaybe<Scalars['String']['input']>;
  useEnv?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AddDatabaseConnectionMutation = { __typename?: 'Mutation', addDatabaseConnection: string };

export type HasDatabaseEnvQueryVariables = Exact<{ [key: string]: never; }>;


export type HasDatabaseEnvQuery = { __typename?: 'Query', hasDatabaseEnv: boolean };

export type DoltDatabaseDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type DoltDatabaseDetailsQuery = { __typename?: 'Query', doltDatabaseDetails: { __typename?: 'DoltDatabaseDetails', isDolt: boolean, hideDoltFeatures: boolean } };

export type ColumnForDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type ForeignKeyColumnForDataTableFragment = { __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number };

export type ForeignKeysForDataTableFragment = { __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> };

export type DataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type DataTableQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }> } };

export type RowForDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowListRowsFragment = { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> };

export type RowsForDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RowsForDataTableQuery = { __typename?: 'Query', rows: { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type DoltWriterForHistoryFragment = { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string };

export type CommitForHistoryFragment = { __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } };

export type CommitListForHistoryFragment = { __typename?: 'CommitList', nextOffset?: number | null, list: Array<{ __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> };

export type HistoryForBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HistoryForBranchQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', nextOffset?: number | null, list: Array<{ __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> } };

export type TableNamesQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type TableNamesQuery = { __typename?: 'Query', tableNames: { __typename?: 'TableNames', list: Array<string> } };

export const BranchForBranchSelectorFragmentDoc = gql`
    fragment BranchForBranchSelector on Branch {
  branchName
  databaseName
}
    `;
export const DoltWriterForHistoryFragmentDoc = gql`
    fragment DoltWriterForHistory on DoltWriter {
  _id
  username
  displayName
  emailAddress
}
    `;
export const TagForListFragmentDoc = gql`
    fragment TagForList on Tag {
  _id
  tagName
  message
  taggedAt
  tagger {
    ...DoltWriterForHistory
  }
  commitId
}
    ${DoltWriterForHistoryFragmentDoc}`;
export const TagListForTagListFragmentDoc = gql`
    fragment TagListForTagList on TagList {
  list {
    ...TagForList
  }
}
    ${TagForListFragmentDoc}`;
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
export const RowForViewsFragmentDoc = gql`
    fragment RowForViews on Row {
  columnValues {
    displayValue
  }
}
    `;
export const BranchFragmentDoc = gql`
    fragment Branch on Branch {
  _id
  branchName
  databaseName
  lastUpdated
  lastCommitter
}
    `;
export const BranchForCreateBranchFragmentDoc = gql`
    fragment BranchForCreateBranch on Branch {
  databaseName
  branchName
}
    `;
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
export const CommitForHistoryFragmentDoc = gql`
    fragment CommitForHistory on Commit {
  _id
  committer {
    ...DoltWriterForHistory
  }
  message
  commitId
  committedAt
  parents
}
    ${DoltWriterForHistoryFragmentDoc}`;
export const CommitListForHistoryFragmentDoc = gql`
    fragment CommitListForHistory on CommitList {
  list {
    ...CommitForHistory
  }
  nextOffset
}
    ${CommitForHistoryFragmentDoc}`;
export const CreateDatabaseDocument = gql`
    mutation CreateDatabase($databaseName: String!) {
  createDatabase(databaseName: $databaseName)
}
    `;
export type CreateDatabaseMutationFn = Apollo.MutationFunction<CreateDatabaseMutation, CreateDatabaseMutationVariables>;

/**
 * __useCreateDatabaseMutation__
 *
 * To run a mutation, you first call `useCreateDatabaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDatabaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDatabaseMutation, { data, loading, error }] = useCreateDatabaseMutation({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useCreateDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<CreateDatabaseMutation, CreateDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDatabaseMutation, CreateDatabaseMutationVariables>(CreateDatabaseDocument, options);
      }
export type CreateDatabaseMutationHookResult = ReturnType<typeof useCreateDatabaseMutation>;
export type CreateDatabaseMutationResult = Apollo.MutationResult<CreateDatabaseMutation>;
export type CreateDatabaseMutationOptions = Apollo.BaseMutationOptions<CreateDatabaseMutation, CreateDatabaseMutationVariables>;
export const BranchesForSelectorDocument = gql`
    query BranchesForSelector($databaseName: String!) {
  branches(databaseName: $databaseName) {
    list {
      ...BranchForBranchSelector
    }
  }
}
    ${BranchForBranchSelectorFragmentDoc}`;

/**
 * __useBranchesForSelectorQuery__
 *
 * To run a query within a React component, call `useBranchesForSelectorQuery` and pass it any options that fit your needs.
 * When your component renders, `useBranchesForSelectorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBranchesForSelectorQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useBranchesForSelectorQuery(baseOptions: Apollo.QueryHookOptions<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>(BranchesForSelectorDocument, options);
      }
export function useBranchesForSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>(BranchesForSelectorDocument, options);
        }
export type BranchesForSelectorQueryHookResult = ReturnType<typeof useBranchesForSelectorQuery>;
export type BranchesForSelectorLazyQueryHookResult = ReturnType<typeof useBranchesForSelectorLazyQuery>;
export type BranchesForSelectorQueryResult = Apollo.QueryResult<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>;
export const TagListDocument = gql`
    query TagList($databaseName: String!) {
  tags(databaseName: $databaseName) {
    ...TagListForTagList
  }
}
    ${TagListForTagListFragmentDoc}`;

/**
 * __useTagListQuery__
 *
 * To run a query within a React component, call `useTagListQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagListQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useTagListQuery(baseOptions: Apollo.QueryHookOptions<TagListQuery, TagListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TagListQuery, TagListQueryVariables>(TagListDocument, options);
      }
export function useTagListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TagListQuery, TagListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TagListQuery, TagListQueryVariables>(TagListDocument, options);
        }
export type TagListQueryHookResult = ReturnType<typeof useTagListQuery>;
export type TagListLazyQueryHookResult = ReturnType<typeof useTagListLazyQuery>;
export type TagListQueryResult = Apollo.QueryResult<TagListQuery, TagListQueryVariables>;
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
export const SqlSelectForCsvDownloadDocument = gql`
    query SqlSelectForCsvDownload($databaseName: String!, $refName: String!, $queryString: String!) {
  sqlSelectForCsvDownload(
    databaseName: $databaseName
    refName: $refName
    queryString: $queryString
  )
}
    `;

/**
 * __useSqlSelectForCsvDownloadQuery__
 *
 * To run a query within a React component, call `useSqlSelectForCsvDownloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useSqlSelectForCsvDownloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSqlSelectForCsvDownloadQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      queryString: // value for 'queryString'
 *   },
 * });
 */
export function useSqlSelectForCsvDownloadQuery(baseOptions: Apollo.QueryHookOptions<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>(SqlSelectForCsvDownloadDocument, options);
      }
export function useSqlSelectForCsvDownloadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>(SqlSelectForCsvDownloadDocument, options);
        }
export type SqlSelectForCsvDownloadQueryHookResult = ReturnType<typeof useSqlSelectForCsvDownloadQuery>;
export type SqlSelectForCsvDownloadLazyQueryHookResult = ReturnType<typeof useSqlSelectForCsvDownloadLazyQuery>;
export type SqlSelectForCsvDownloadQueryResult = Apollo.QueryResult<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>;
export const DatabasesDocument = gql`
    query Databases {
  databases
}
    `;

/**
 * __useDatabasesQuery__
 *
 * To run a query within a React component, call `useDatabasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatabasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatabasesQuery({
 *   variables: {
 *   },
 * });
 */
export function useDatabasesQuery(baseOptions?: Apollo.QueryHookOptions<DatabasesQuery, DatabasesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatabasesQuery, DatabasesQueryVariables>(DatabasesDocument, options);
      }
export function useDatabasesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatabasesQuery, DatabasesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatabasesQuery, DatabasesQueryVariables>(DatabasesDocument, options);
        }
export type DatabasesQueryHookResult = ReturnType<typeof useDatabasesQuery>;
export type DatabasesLazyQueryHookResult = ReturnType<typeof useDatabasesLazyQuery>;
export type DatabasesQueryResult = Apollo.QueryResult<DatabasesQuery, DatabasesQueryVariables>;
export const TableListForSchemasDocument = gql`
    query TableListForSchemas($databaseName: String!, $refName: String!) {
  tables(databaseName: $databaseName, refName: $refName) {
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
 *      refName: // value for 'refName'
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
    query SqlSelectForSqlDataTable($databaseName: String!, $refName: String!, $queryString: String!) {
  sqlSelect(
    databaseName: $databaseName
    refName: $refName
    queryString: $queryString
  ) {
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
 *      refName: // value for 'refName'
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
    query TableForBranch($databaseName: String!, $refName: String!, $tableName: String!) {
  table(databaseName: $databaseName, refName: $refName, tableName: $tableName) {
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
 *      refName: // value for 'refName'
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
export const RowsForViewsDocument = gql`
    query RowsForViews($databaseName: String!, $refName: String!) {
  views(databaseName: $databaseName, refName: $refName) {
    list {
      ...RowForViews
    }
  }
}
    ${RowForViewsFragmentDoc}`;

/**
 * __useRowsForViewsQuery__
 *
 * To run a query within a React component, call `useRowsForViewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRowsForViewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRowsForViewsQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useRowsForViewsQuery(baseOptions: Apollo.QueryHookOptions<RowsForViewsQuery, RowsForViewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForViewsQuery, RowsForViewsQueryVariables>(RowsForViewsDocument, options);
      }
export function useRowsForViewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForViewsQuery, RowsForViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForViewsQuery, RowsForViewsQueryVariables>(RowsForViewsDocument, options);
        }
export type RowsForViewsQueryHookResult = ReturnType<typeof useRowsForViewsQuery>;
export type RowsForViewsLazyQueryHookResult = ReturnType<typeof useRowsForViewsLazyQuery>;
export type RowsForViewsQueryResult = Apollo.QueryResult<RowsForViewsQuery, RowsForViewsQueryVariables>;
export const BranchListDocument = gql`
    query BranchList($databaseName: String!, $sortBy: SortBranchesBy) {
  branches(databaseName: $databaseName, sortBy: $sortBy) {
    list {
      ...Branch
    }
  }
}
    ${BranchFragmentDoc}`;

/**
 * __useBranchListQuery__
 *
 * To run a query within a React component, call `useBranchListQuery` and pass it any options that fit your needs.
 * When your component renders, `useBranchListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBranchListQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      sortBy: // value for 'sortBy'
 *   },
 * });
 */
export function useBranchListQuery(baseOptions: Apollo.QueryHookOptions<BranchListQuery, BranchListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchListQuery, BranchListQueryVariables>(BranchListDocument, options);
      }
export function useBranchListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchListQuery, BranchListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchListQuery, BranchListQueryVariables>(BranchListDocument, options);
        }
export type BranchListQueryHookResult = ReturnType<typeof useBranchListQuery>;
export type BranchListLazyQueryHookResult = ReturnType<typeof useBranchListLazyQuery>;
export type BranchListQueryResult = Apollo.QueryResult<BranchListQuery, BranchListQueryVariables>;
export const DeleteBranchDocument = gql`
    mutation DeleteBranch($branchName: String!, $databaseName: String!) {
  deleteBranch(branchName: $branchName, databaseName: $databaseName)
}
    `;
export type DeleteBranchMutationFn = Apollo.MutationFunction<DeleteBranchMutation, DeleteBranchMutationVariables>;

/**
 * __useDeleteBranchMutation__
 *
 * To run a mutation, you first call `useDeleteBranchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBranchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBranchMutation, { data, loading, error }] = useDeleteBranchMutation({
 *   variables: {
 *      branchName: // value for 'branchName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useDeleteBranchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBranchMutation, DeleteBranchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBranchMutation, DeleteBranchMutationVariables>(DeleteBranchDocument, options);
      }
export type DeleteBranchMutationHookResult = ReturnType<typeof useDeleteBranchMutation>;
export type DeleteBranchMutationResult = Apollo.MutationResult<DeleteBranchMutation>;
export type DeleteBranchMutationOptions = Apollo.BaseMutationOptions<DeleteBranchMutation, DeleteBranchMutationVariables>;
export const CreateBranchDocument = gql`
    mutation CreateBranch($newBranchName: String!, $databaseName: String!, $fromRefName: String!) {
  createBranch(
    newBranchName: $newBranchName
    databaseName: $databaseName
    fromRefName: $fromRefName
  ) {
    ...BranchForCreateBranch
  }
}
    ${BranchForCreateBranchFragmentDoc}`;
export type CreateBranchMutationFn = Apollo.MutationFunction<CreateBranchMutation, CreateBranchMutationVariables>;

/**
 * __useCreateBranchMutation__
 *
 * To run a mutation, you first call `useCreateBranchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBranchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBranchMutation, { data, loading, error }] = useCreateBranchMutation({
 *   variables: {
 *      newBranchName: // value for 'newBranchName'
 *      databaseName: // value for 'databaseName'
 *      fromRefName: // value for 'fromRefName'
 *   },
 * });
 */
export function useCreateBranchMutation(baseOptions?: Apollo.MutationHookOptions<CreateBranchMutation, CreateBranchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBranchMutation, CreateBranchMutationVariables>(CreateBranchDocument, options);
      }
export type CreateBranchMutationHookResult = ReturnType<typeof useCreateBranchMutation>;
export type CreateBranchMutationResult = Apollo.MutationResult<CreateBranchMutation>;
export type CreateBranchMutationOptions = Apollo.BaseMutationOptions<CreateBranchMutation, CreateBranchMutationVariables>;
export const DefaultBranchPageQueryDocument = gql`
    query DefaultBranchPageQuery($databaseName: String!, $filterSystemTables: Boolean) {
  defaultBranch(databaseName: $databaseName) {
    _id
    branchName
    tableNames(filterSystemTables: $filterSystemTables)
  }
}
    `;

/**
 * __useDefaultBranchPageQuery__
 *
 * To run a query within a React component, call `useDefaultBranchPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useDefaultBranchPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDefaultBranchPageQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      filterSystemTables: // value for 'filterSystemTables'
 *   },
 * });
 */
export function useDefaultBranchPageQuery(baseOptions: Apollo.QueryHookOptions<DefaultBranchPageQuery, DefaultBranchPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DefaultBranchPageQuery, DefaultBranchPageQueryVariables>(DefaultBranchPageQueryDocument, options);
      }
export function useDefaultBranchPageQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DefaultBranchPageQuery, DefaultBranchPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DefaultBranchPageQuery, DefaultBranchPageQueryVariables>(DefaultBranchPageQueryDocument, options);
        }
export type DefaultBranchPageQueryHookResult = ReturnType<typeof useDefaultBranchPageQuery>;
export type DefaultBranchPageQueryLazyQueryHookResult = ReturnType<typeof useDefaultBranchPageQueryLazyQuery>;
export type DefaultBranchPageQueryQueryResult = Apollo.QueryResult<DefaultBranchPageQuery, DefaultBranchPageQueryVariables>;
export const RefPageQueryDocument = gql`
    query RefPageQuery($refName: String!, $databaseName: String!, $filterSystemTables: Boolean) {
  branch(databaseName: $databaseName, branchName: $refName) {
    _id
  }
  tableNames(
    refName: $refName
    databaseName: $databaseName
    filterSystemTables: $filterSystemTables
  ) {
    list
  }
}
    `;

/**
 * __useRefPageQuery__
 *
 * To run a query within a React component, call `useRefPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefPageQuery({
 *   variables: {
 *      refName: // value for 'refName'
 *      databaseName: // value for 'databaseName'
 *      filterSystemTables: // value for 'filterSystemTables'
 *   },
 * });
 */
export function useRefPageQuery(baseOptions: Apollo.QueryHookOptions<RefPageQuery, RefPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RefPageQuery, RefPageQueryVariables>(RefPageQueryDocument, options);
      }
export function useRefPageQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RefPageQuery, RefPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RefPageQuery, RefPageQueryVariables>(RefPageQueryDocument, options);
        }
export type RefPageQueryHookResult = ReturnType<typeof useRefPageQuery>;
export type RefPageQueryLazyQueryHookResult = ReturnType<typeof useRefPageQueryLazyQuery>;
export type RefPageQueryQueryResult = Apollo.QueryResult<RefPageQuery, RefPageQueryVariables>;
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
export const DoltDatabaseDetailsDocument = gql`
    query DoltDatabaseDetails {
  doltDatabaseDetails {
    isDolt
    hideDoltFeatures
  }
}
    `;

/**
 * __useDoltDatabaseDetailsQuery__
 *
 * To run a query within a React component, call `useDoltDatabaseDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDoltDatabaseDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDoltDatabaseDetailsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDoltDatabaseDetailsQuery(baseOptions?: Apollo.QueryHookOptions<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>(DoltDatabaseDetailsDocument, options);
      }
export function useDoltDatabaseDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>(DoltDatabaseDetailsDocument, options);
        }
export type DoltDatabaseDetailsQueryHookResult = ReturnType<typeof useDoltDatabaseDetailsQuery>;
export type DoltDatabaseDetailsLazyQueryHookResult = ReturnType<typeof useDoltDatabaseDetailsLazyQuery>;
export type DoltDatabaseDetailsQueryResult = Apollo.QueryResult<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>;
export const DataTableQueryDocument = gql`
    query DataTableQuery($databaseName: String!, $refName: String!, $tableName: String!) {
  table(databaseName: $databaseName, refName: $refName, tableName: $tableName) {
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
 *      refName: // value for 'refName'
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
    query RowsForDataTableQuery($databaseName: String!, $refName: String!, $tableName: String!, $offset: Int) {
  rows(
    databaseName: $databaseName
    refName: $refName
    tableName: $tableName
    offset: $offset
  ) {
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
 *      refName: // value for 'refName'
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
export const HistoryForBranchDocument = gql`
    query HistoryForBranch($databaseName: String!, $refName: String!, $offset: Int) {
  commits(databaseName: $databaseName, refName: $refName, offset: $offset) {
    ...CommitListForHistory
  }
}
    ${CommitListForHistoryFragmentDoc}`;

/**
 * __useHistoryForBranchQuery__
 *
 * To run a query within a React component, call `useHistoryForBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useHistoryForBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHistoryForBranchQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useHistoryForBranchQuery(baseOptions: Apollo.QueryHookOptions<HistoryForBranchQuery, HistoryForBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HistoryForBranchQuery, HistoryForBranchQueryVariables>(HistoryForBranchDocument, options);
      }
export function useHistoryForBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HistoryForBranchQuery, HistoryForBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HistoryForBranchQuery, HistoryForBranchQueryVariables>(HistoryForBranchDocument, options);
        }
export type HistoryForBranchQueryHookResult = ReturnType<typeof useHistoryForBranchQuery>;
export type HistoryForBranchLazyQueryHookResult = ReturnType<typeof useHistoryForBranchLazyQuery>;
export type HistoryForBranchQueryResult = Apollo.QueryResult<HistoryForBranchQuery, HistoryForBranchQueryVariables>;
export const TableNamesDocument = gql`
    query TableNames($databaseName: String!, $refName: String!, $filterSystemTables: Boolean) {
  tableNames(
    databaseName: $databaseName
    refName: $refName
    filterSystemTables: $filterSystemTables
  ) {
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
 *      refName: // value for 'refName'
 *      filterSystemTables: // value for 'filterSystemTables'
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