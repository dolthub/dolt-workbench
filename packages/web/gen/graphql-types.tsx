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
  Upload: { input: any; output: any; }
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
  sourceTable?: Maybe<Scalars['String']['output']>;
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

export enum CommitDiffType {
  ThreeDot = 'ThreeDot',
  TwoDot = 'TwoDot',
  Unspecified = 'Unspecified'
}

export type CommitList = {
  __typename?: 'CommitList';
  list: Array<Commit>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

export enum DiffRowType {
  Added = 'Added',
  All = 'All',
  Modified = 'Modified',
  Removed = 'Removed'
}

export type DiffStat = {
  __typename?: 'DiffStat';
  cellCount: Scalars['Float']['output'];
  cellsModified: Scalars['Float']['output'];
  rowCount: Scalars['Float']['output'];
  rowsAdded: Scalars['Float']['output'];
  rowsDeleted: Scalars['Float']['output'];
  rowsModified: Scalars['Float']['output'];
  rowsUnmodified: Scalars['Float']['output'];
};

export type DiffSummary = {
  __typename?: 'DiffSummary';
  _id: Scalars['ID']['output'];
  fromTableName: Scalars['String']['output'];
  hasDataChanges: Scalars['Boolean']['output'];
  hasSchemaChanges: Scalars['Boolean']['output'];
  tableName: Scalars['String']['output'];
  tableType: TableDiffType;
  toTableName: Scalars['String']['output'];
};

export type Doc = {
  __typename?: 'Doc';
  branchName: Scalars['String']['output'];
  docRow?: Maybe<Row>;
  docType: Scalars['String']['output'];
};

export type DocList = {
  __typename?: 'DocList';
  list: Array<Doc>;
};

export enum DocType {
  License = 'License',
  Readme = 'Readme',
  Unspecified = 'Unspecified'
}

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

export enum FileType {
  Csv = 'Csv',
  Psv = 'Psv'
}

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

export enum ImportOperation {
  Update = 'Update'
}

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

export enum LoadDataModifier {
  Ignore = 'Ignore',
  Replace = 'Replace'
}

export type Mutation = {
  __typename?: 'Mutation';
  addDatabaseConnection?: Maybe<Scalars['String']['output']>;
  createBranch: Branch;
  createDatabase: Scalars['Boolean']['output'];
  createTag: Tag;
  deleteBranch: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  loadDataFile: Scalars['Boolean']['output'];
  resetDatabase: Scalars['Boolean']['output'];
};


export type MutationAddDatabaseConnectionArgs = {
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
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


export type MutationCreateTagArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  tagName: Scalars['String']['input'];
};


export type MutationDeleteBranchArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
};


export type MutationDeleteTagArgs = {
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
};


export type MutationLoadDataFileArgs = {
  databaseName: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  fileType: FileType;
  importOp: ImportOperation;
  modifier?: InputMaybe<LoadDataModifier>;
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
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
  diffStat: DiffStat;
  diffSummaries: Array<DiffSummary>;
  docOrDefaultDoc?: Maybe<Doc>;
  docs: DocList;
  doltDatabaseDetails: DoltDatabaseDetails;
  doltProcedures: Array<SchemaItem>;
  doltSchemas: Array<SchemaItem>;
  hasDatabaseEnv: Scalars['Boolean']['output'];
  rowDiffs: RowDiffList;
  rows: RowList;
  schemaDiff?: Maybe<SchemaDiff>;
  sqlSelect: SqlSelect;
  sqlSelectForCsvDownload: Scalars['String']['output'];
  status: Array<Status>;
  table: Table;
  tableNames: TableNames;
  tables: Array<Table>;
  tag?: Maybe<Tag>;
  tags: TagList;
  views: Array<SchemaItem>;
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
  afterCommitId?: InputMaybe<Scalars['String']['input']>;
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDefaultBranchArgs = {
  databaseName: Scalars['String']['input'];
};


export type QueryDiffStatArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryDiffSummariesArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryDocOrDefaultDocArgs = {
  databaseName: Scalars['String']['input'];
  docType?: InputMaybe<DocType>;
  refName: Scalars['String']['input'];
};


export type QueryDocsArgs = {
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryDoltProceduresArgs = {
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryDoltSchemasArgs = {
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryRowDiffsArgs = {
  databaseName: Scalars['String']['input'];
  filterByRowType?: InputMaybe<DiffRowType>;
  fromRefName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryRowsArgs = {
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type QuerySchemaDiffArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
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


export type QueryStatusArgs = {
  databaseName: Scalars['String']['input'];
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


export type QueryTagArgs = {
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
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

export type RowDiff = {
  __typename?: 'RowDiff';
  added?: Maybe<Row>;
  deleted?: Maybe<Row>;
};

export type RowDiffList = {
  __typename?: 'RowDiffList';
  columns: Array<Column>;
  list: Array<RowDiff>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

export type RowList = {
  __typename?: 'RowList';
  list: Array<Row>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

export type SchemaDiff = {
  __typename?: 'SchemaDiff';
  numChangedSchemas?: Maybe<Scalars['Int']['output']>;
  schemaDiff?: Maybe<TextDiff>;
  schemaPatch?: Maybe<Array<Scalars['String']['output']>>;
};

export type SchemaItem = {
  __typename?: 'SchemaItem';
  name: Scalars['String']['output'];
  type: SchemaType;
};

export enum SchemaType {
  Event = 'Event',
  Procedure = 'Procedure',
  Table = 'Table',
  Trigger = 'Trigger',
  View = 'View'
}

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

export type Status = {
  __typename?: 'Status';
  _id: Scalars['ID']['output'];
  refName: Scalars['String']['output'];
  staged: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  tableName: Scalars['String']['output'];
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

export enum TableDiffType {
  Added = 'Added',
  Dropped = 'Dropped',
  Modified = 'Modified',
  Renamed = 'Renamed'
}

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

export type TextDiff = {
  __typename?: 'TextDiff';
  leftLines: Scalars['String']['output'];
  rightLines: Scalars['String']['output'];
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

export type ResetDatabaseMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetDatabaseMutation = { __typename?: 'Mutation', resetDatabase: boolean };

export type GetTagQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
}>;


export type GetTagQuery = { __typename?: 'Query', tag?: { __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } } | null };

export type GetBranchQueryVariables = Exact<{
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type GetBranchQuery = { __typename?: 'Query', branch?: { __typename?: 'Branch', _id: string } | null };

export type SqlSelectForCsvDownloadQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForCsvDownloadQuery = { __typename?: 'Query', sqlSelectForCsvDownload: string };

export type DatabasesQueryVariables = Exact<{ [key: string]: never; }>;


export type DatabasesQuery = { __typename?: 'Query', databases: Array<string> };

export type CommitForDiffSelectorFragment = { __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } };

export type CommitListForDiffSelectorFragment = { __typename?: 'CommitList', list: Array<{ __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } }> };

export type CommitsForDiffSelectorQueryVariables = Exact<{
  refName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type CommitsForDiffSelectorQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', list: Array<{ __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } }> } };

export type DiffStatForDiffsFragment = { __typename?: 'DiffStat', rowsUnmodified: number, rowsAdded: number, rowsDeleted: number, rowsModified: number, cellsModified: number, rowCount: number, cellCount: number };

export type DiffStatQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CommitDiffType>;
  tableName?: InputMaybe<Scalars['String']['input']>;
}>;


export type DiffStatQuery = { __typename?: 'Query', diffStat: { __typename?: 'DiffStat', rowsUnmodified: number, rowsAdded: number, rowsDeleted: number, rowsModified: number, cellsModified: number, rowCount: number, cellCount: number } };

export type ColumnForDiffTableListFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type ColumnValueForTableListFragment = { __typename?: 'ColumnValue', displayValue: string };

export type RowForTableListFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowDiffForTableListFragment = { __typename?: 'RowDiff', added?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null, deleted?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null };

export type RowDiffListWithColsFragment = { __typename?: 'RowDiffList', nextOffset?: number | null, list: Array<{ __typename?: 'RowDiff', added?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null, deleted?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }>, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> };

export type RowDiffsQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  filterByRowType?: InputMaybe<DiffRowType>;
  type?: InputMaybe<CommitDiffType>;
}>;


export type RowDiffsQuery = { __typename?: 'Query', rowDiffs: { __typename?: 'RowDiffList', nextOffset?: number | null, list: Array<{ __typename?: 'RowDiff', added?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null, deleted?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }>, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> } };

export type SchemaDiffForTableListFragment = { __typename?: 'TextDiff', leftLines: string, rightLines: string };

export type SchemaDiffFragment = { __typename?: 'SchemaDiff', schemaPatch?: Array<string> | null, schemaDiff?: { __typename?: 'TextDiff', leftLines: string, rightLines: string } | null };

export type SchemaDiffQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SchemaDiffQuery = { __typename?: 'Query', schemaDiff?: { __typename?: 'SchemaDiff', schemaPatch?: Array<string> | null, schemaDiff?: { __typename?: 'TextDiff', leftLines: string, rightLines: string } | null } | null };

export type ColumnsListForTableListFragment = { __typename?: 'IndexColumn', name: string, sqlType?: string | null };

export type IndexForTableListFragment = { __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> };

export type TableForSchemaListFragment = { __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> };

export type TableListForSchemasQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type TableListForSchemasQuery = { __typename?: 'Query', tables: Array<{ __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> }> };

export type SchemaItemFragment = { __typename?: 'SchemaItem', name: string, type: SchemaType };

export type RowsForDoltSchemasQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type RowsForDoltSchemasQuery = { __typename?: 'Query', doltSchemas: Array<{ __typename?: 'SchemaItem', name: string, type: SchemaType }> };

export type RowsForDoltProceduresQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type RowsForDoltProceduresQuery = { __typename?: 'Query', doltProcedures: Array<{ __typename?: 'SchemaItem', name: string, type: SchemaType }> };

export type RowForSqlDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type ColumnForSqlDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null };

export type SqlSelectForSqlDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForSqlDataTableQuery = { __typename?: 'Query', sqlSelect: { __typename?: 'SqlSelect', queryExecutionStatus: QueryExecutionStatus, queryExecutionMessage: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null }>, rows: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type StatusFragment = { __typename?: 'Status', _id: string, refName: string, tableName: string, staged: boolean, status: string };

export type GetStatusQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type GetStatusQuery = { __typename?: 'Query', status: Array<{ __typename?: 'Status', _id: string, refName: string, tableName: string, staged: boolean, status: string }> };

export type ColumnForTableListFragment = { __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type TableWithColumnsFragment = { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> };

export type TableForBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type TableForBranchQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> } };

export type RowsForViewsQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type RowsForViewsQuery = { __typename?: 'Query', views: Array<{ __typename?: 'SchemaItem', name: string, type: SchemaType }> };

export type AddDatabaseConnectionMutationVariables = Exact<{
  url?: InputMaybe<Scalars['String']['input']>;
  useEnv?: InputMaybe<Scalars['Boolean']['input']>;
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AddDatabaseConnectionMutation = { __typename?: 'Mutation', addDatabaseConnection?: string | null };

export type HasDatabaseEnvQueryVariables = Exact<{ [key: string]: never; }>;


export type HasDatabaseEnvQuery = { __typename?: 'Query', hasDatabaseEnv: boolean };

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

export type CommitForAfterCommitHistoryFragment = { __typename?: 'Commit', _id: string, commitId: string, parents: Array<string>, message: string, committedAt: any, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } };

export type HistoryForCommitQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  afterCommitId: Scalars['String']['input'];
}>;


export type HistoryForCommitQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', list: Array<{ __typename?: 'Commit', _id: string, commitId: string, parents: Array<string>, message: string, committedAt: any, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } }> } };

export type DefaultBranchPageQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DefaultBranchPageQuery = { __typename?: 'Query', defaultBranch?: { __typename?: 'Branch', _id: string, branchName: string, tableNames: Array<string> } | null };

export type DocRowForDocPageFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type DocForDocPageFragment = { __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null };

export type DocListForDocPageFragment = { __typename?: 'DocList', list: Array<{ __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }> };

export type DocsRowsForDocPageQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type DocsRowsForDocPageQuery = { __typename?: 'Query', docs: { __typename?: 'DocList', list: Array<{ __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }> } };

export type DocColumnValuesForDocPageFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type DocDataForDocPageQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  docType?: InputMaybe<DocType>;
}>;


export type DocDataForDocPageQuery = { __typename?: 'Query', docOrDefaultDoc?: { __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null } | null };

export type DocPageQueryNoBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type DocPageQueryNoBranchQuery = { __typename?: 'Query', branchOrDefault?: { __typename?: 'Branch', _id: string, branchName: string } | null };

export type RefPageQueryVariables = Exact<{
  refName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RefPageQuery = { __typename?: 'Query', branch?: { __typename?: 'Branch', _id: string } | null, tableNames: { __typename?: 'TableNames', list: Array<string> } };

export type CreateTagMutationVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  fromRefName: Scalars['String']['input'];
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag: { __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } } };

export type DeleteTagMutationVariables = Exact<{
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
}>;


export type DeleteTagMutation = { __typename?: 'Mutation', deleteTag: boolean };

export type LoadDataMutationVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  importOp: ImportOperation;
  fileType: FileType;
  file: Scalars['Upload']['input'];
  modifier?: InputMaybe<LoadDataModifier>;
}>;


export type LoadDataMutation = { __typename?: 'Mutation', loadDataFile: boolean };

export type DoltDatabaseDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type DoltDatabaseDetailsQuery = { __typename?: 'Query', doltDatabaseDetails: { __typename?: 'DoltDatabaseDetails', isDolt: boolean, hideDoltFeatures: boolean } };

export type ColumnForDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type ForeignKeyColumnForDataTableFragment = { __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number };

export type ForeignKeysForDataTableFragment = { __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> };

export type DataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
}>;


export type DataTableQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }> } };

export type RowForDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowListRowsFragment = { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> };

export type RowsForDataTableQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RowsForDataTableQuery = { __typename?: 'Query', rows: { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type DiffSummaryFragment = { __typename?: 'DiffSummary', _id: string, fromTableName: string, toTableName: string, tableName: string, tableType: TableDiffType, hasDataChanges: boolean, hasSchemaChanges: boolean };

export type DiffSummariesQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CommitDiffType>;
}>;


export type DiffSummariesQuery = { __typename?: 'Query', diffSummaries: Array<{ __typename?: 'DiffSummary', _id: string, fromTableName: string, toTableName: string, tableName: string, tableType: TableDiffType, hasDataChanges: boolean, hasSchemaChanges: boolean }> };

export type DoltWriterForHistoryFragment = { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string };

export type CommitForHistoryFragment = { __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } };

export type CommitListForHistoryFragment = { __typename?: 'CommitList', nextOffset?: number | null, list: Array<{ __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> };

export type HistoryForBranchQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HistoryForBranchQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', nextOffset?: number | null, list: Array<{ __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> } };

export type BranchForCommitGraphFragment = { __typename?: 'Branch', branchName: string, head?: string | null };

export type BranchListForCommitGraphQueryVariables = Exact<{
  databaseName: Scalars['String']['input'];
}>;


export type BranchListForCommitGraphQuery = { __typename?: 'Query', branches: { __typename?: 'BranchNamesList', list: Array<{ __typename?: 'Branch', branchName: string, head?: string | null }> } };

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
export const CommitForDiffSelectorFragmentDoc = gql`
    fragment CommitForDiffSelector on Commit {
  _id
  commitId
  message
  committedAt
  parents
  committer {
    _id
    displayName
    username
  }
}
    `;
export const CommitListForDiffSelectorFragmentDoc = gql`
    fragment CommitListForDiffSelector on CommitList {
  list {
    ...CommitForDiffSelector
  }
}
    ${CommitForDiffSelectorFragmentDoc}`;
export const DiffStatForDiffsFragmentDoc = gql`
    fragment DiffStatForDiffs on DiffStat {
  rowsUnmodified
  rowsAdded
  rowsDeleted
  rowsModified
  cellsModified
  rowCount
  cellCount
}
    `;
export const ColumnValueForTableListFragmentDoc = gql`
    fragment ColumnValueForTableList on ColumnValue {
  displayValue
}
    `;
export const RowForTableListFragmentDoc = gql`
    fragment RowForTableList on Row {
  columnValues {
    ...ColumnValueForTableList
  }
}
    ${ColumnValueForTableListFragmentDoc}`;
export const RowDiffForTableListFragmentDoc = gql`
    fragment RowDiffForTableList on RowDiff {
  added {
    ...RowForTableList
  }
  deleted {
    ...RowForTableList
  }
}
    ${RowForTableListFragmentDoc}`;
export const ColumnForDiffTableListFragmentDoc = gql`
    fragment ColumnForDiffTableList on Column {
  name
  isPrimaryKey
  type
  constraints {
    notNull
  }
}
    `;
export const RowDiffListWithColsFragmentDoc = gql`
    fragment RowDiffListWithCols on RowDiffList {
  list {
    ...RowDiffForTableList
  }
  columns {
    ...ColumnForDiffTableList
  }
  nextOffset
}
    ${RowDiffForTableListFragmentDoc}
${ColumnForDiffTableListFragmentDoc}`;
export const SchemaDiffForTableListFragmentDoc = gql`
    fragment SchemaDiffForTableList on TextDiff {
  leftLines
  rightLines
}
    `;
export const SchemaDiffFragmentDoc = gql`
    fragment SchemaDiff on SchemaDiff {
  schemaDiff {
    ...SchemaDiffForTableList
  }
  schemaPatch
}
    ${SchemaDiffForTableListFragmentDoc}`;
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
export const SchemaItemFragmentDoc = gql`
    fragment SchemaItem on SchemaItem {
  name
  type
}
    `;
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
  sourceTable
}
    `;
export const StatusFragmentDoc = gql`
    fragment Status on Status {
  _id
  refName
  tableName
  staged
  status
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
export const CommitForAfterCommitHistoryFragmentDoc = gql`
    fragment CommitForAfterCommitHistory on Commit {
  _id
  commitId
  parents
  message
  committedAt
  committer {
    _id
    displayName
    username
  }
}
    `;
export const DocRowForDocPageFragmentDoc = gql`
    fragment DocRowForDocPage on Row {
  columnValues {
    displayValue
  }
}
    `;
export const DocForDocPageFragmentDoc = gql`
    fragment DocForDocPage on Doc {
  docRow {
    ...DocRowForDocPage
  }
}
    ${DocRowForDocPageFragmentDoc}`;
export const DocListForDocPageFragmentDoc = gql`
    fragment DocListForDocPage on DocList {
  list {
    ...DocForDocPage
  }
}
    ${DocForDocPageFragmentDoc}`;
export const DocColumnValuesForDocPageFragmentDoc = gql`
    fragment DocColumnValuesForDocPage on Row {
  columnValues {
    displayValue
  }
}
    `;
export const ColumnForDataTableFragmentDoc = gql`
    fragment ColumnForDataTable on Column {
  name
  isPrimaryKey
  type
  sourceTable
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
export const DiffSummaryFragmentDoc = gql`
    fragment DiffSummary on DiffSummary {
  _id
  fromTableName
  toTableName
  tableName
  tableType
  hasDataChanges
  hasSchemaChanges
}
    `;
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
export const BranchForCommitGraphFragmentDoc = gql`
    fragment BranchForCommitGraph on Branch {
  branchName
  head
}
    `;
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
export const ResetDatabaseDocument = gql`
    mutation ResetDatabase {
  resetDatabase
}
    `;
export type ResetDatabaseMutationFn = Apollo.MutationFunction<ResetDatabaseMutation, ResetDatabaseMutationVariables>;

/**
 * __useResetDatabaseMutation__
 *
 * To run a mutation, you first call `useResetDatabaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetDatabaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetDatabaseMutation, { data, loading, error }] = useResetDatabaseMutation({
 *   variables: {
 *   },
 * });
 */
export function useResetDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<ResetDatabaseMutation, ResetDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetDatabaseMutation, ResetDatabaseMutationVariables>(ResetDatabaseDocument, options);
      }
export type ResetDatabaseMutationHookResult = ReturnType<typeof useResetDatabaseMutation>;
export type ResetDatabaseMutationResult = Apollo.MutationResult<ResetDatabaseMutation>;
export type ResetDatabaseMutationOptions = Apollo.BaseMutationOptions<ResetDatabaseMutation, ResetDatabaseMutationVariables>;
export const GetTagDocument = gql`
    query GetTag($databaseName: String!, $tagName: String!) {
  tag(databaseName: $databaseName, tagName: $tagName) {
    ...TagForList
  }
}
    ${TagForListFragmentDoc}`;

/**
 * __useGetTagQuery__
 *
 * To run a query within a React component, call `useGetTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tagName: // value for 'tagName'
 *   },
 * });
 */
export function useGetTagQuery(baseOptions: Apollo.QueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
      }
export function useGetTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
        }
export type GetTagQueryHookResult = ReturnType<typeof useGetTagQuery>;
export type GetTagLazyQueryHookResult = ReturnType<typeof useGetTagLazyQuery>;
export type GetTagQueryResult = Apollo.QueryResult<GetTagQuery, GetTagQueryVariables>;
export const GetBranchDocument = gql`
    query GetBranch($branchName: String!, $databaseName: String!) {
  branch(branchName: $branchName, databaseName: $databaseName) {
    _id
  }
}
    `;

/**
 * __useGetBranchQuery__
 *
 * To run a query within a React component, call `useGetBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBranchQuery({
 *   variables: {
 *      branchName: // value for 'branchName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useGetBranchQuery(baseOptions: Apollo.QueryHookOptions<GetBranchQuery, GetBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, options);
      }
export function useGetBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBranchQuery, GetBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, options);
        }
export type GetBranchQueryHookResult = ReturnType<typeof useGetBranchQuery>;
export type GetBranchLazyQueryHookResult = ReturnType<typeof useGetBranchLazyQuery>;
export type GetBranchQueryResult = Apollo.QueryResult<GetBranchQuery, GetBranchQueryVariables>;
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
export const CommitsForDiffSelectorDocument = gql`
    query CommitsForDiffSelector($refName: String!, $databaseName: String!) {
  commits(refName: $refName, databaseName: $databaseName) {
    ...CommitListForDiffSelector
  }
}
    ${CommitListForDiffSelectorFragmentDoc}`;

/**
 * __useCommitsForDiffSelectorQuery__
 *
 * To run a query within a React component, call `useCommitsForDiffSelectorQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommitsForDiffSelectorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommitsForDiffSelectorQuery({
 *   variables: {
 *      refName: // value for 'refName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useCommitsForDiffSelectorQuery(baseOptions: Apollo.QueryHookOptions<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>(CommitsForDiffSelectorDocument, options);
      }
export function useCommitsForDiffSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>(CommitsForDiffSelectorDocument, options);
        }
export type CommitsForDiffSelectorQueryHookResult = ReturnType<typeof useCommitsForDiffSelectorQuery>;
export type CommitsForDiffSelectorLazyQueryHookResult = ReturnType<typeof useCommitsForDiffSelectorLazyQuery>;
export type CommitsForDiffSelectorQueryResult = Apollo.QueryResult<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>;
export const DiffStatDocument = gql`
    query DiffStat($databaseName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $type: CommitDiffType, $tableName: String) {
  diffStat(
    databaseName: $databaseName
    fromRefName: $fromRefName
    toRefName: $toRefName
    refName: $refName
    type: $type
    tableName: $tableName
  ) {
    ...DiffStatForDiffs
  }
}
    ${DiffStatForDiffsFragmentDoc}`;

/**
 * __useDiffStatQuery__
 *
 * To run a query within a React component, call `useDiffStatQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiffStatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiffStatQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      type: // value for 'type'
 *      tableName: // value for 'tableName'
 *   },
 * });
 */
export function useDiffStatQuery(baseOptions: Apollo.QueryHookOptions<DiffStatQuery, DiffStatQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiffStatQuery, DiffStatQueryVariables>(DiffStatDocument, options);
      }
export function useDiffStatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiffStatQuery, DiffStatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiffStatQuery, DiffStatQueryVariables>(DiffStatDocument, options);
        }
export type DiffStatQueryHookResult = ReturnType<typeof useDiffStatQuery>;
export type DiffStatLazyQueryHookResult = ReturnType<typeof useDiffStatLazyQuery>;
export type DiffStatQueryResult = Apollo.QueryResult<DiffStatQuery, DiffStatQueryVariables>;
export const RowDiffsDocument = gql`
    query RowDiffs($databaseName: String!, $tableName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $offset: Int, $filterByRowType: DiffRowType, $type: CommitDiffType) {
  rowDiffs(
    databaseName: $databaseName
    tableName: $tableName
    fromRefName: $fromRefName
    toRefName: $toRefName
    refName: $refName
    offset: $offset
    filterByRowType: $filterByRowType
    type: $type
  ) {
    ...RowDiffListWithCols
  }
}
    ${RowDiffListWithColsFragmentDoc}`;

/**
 * __useRowDiffsQuery__
 *
 * To run a query within a React component, call `useRowDiffsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRowDiffsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRowDiffsQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      offset: // value for 'offset'
 *      filterByRowType: // value for 'filterByRowType'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useRowDiffsQuery(baseOptions: Apollo.QueryHookOptions<RowDiffsQuery, RowDiffsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowDiffsQuery, RowDiffsQueryVariables>(RowDiffsDocument, options);
      }
export function useRowDiffsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowDiffsQuery, RowDiffsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowDiffsQuery, RowDiffsQueryVariables>(RowDiffsDocument, options);
        }
export type RowDiffsQueryHookResult = ReturnType<typeof useRowDiffsQuery>;
export type RowDiffsLazyQueryHookResult = ReturnType<typeof useRowDiffsLazyQuery>;
export type RowDiffsQueryResult = Apollo.QueryResult<RowDiffsQuery, RowDiffsQueryVariables>;
export const SchemaDiffDocument = gql`
    query SchemaDiff($databaseName: String!, $tableName: String!, $fromRefName: String!, $toRefName: String!, $refName: String) {
  schemaDiff(
    databaseName: $databaseName
    tableName: $tableName
    fromRefName: $fromRefName
    toRefName: $toRefName
    refName: $refName
  ) {
    ...SchemaDiff
  }
}
    ${SchemaDiffFragmentDoc}`;

/**
 * __useSchemaDiffQuery__
 *
 * To run a query within a React component, call `useSchemaDiffQuery` and pass it any options that fit your needs.
 * When your component renders, `useSchemaDiffQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSchemaDiffQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useSchemaDiffQuery(baseOptions: Apollo.QueryHookOptions<SchemaDiffQuery, SchemaDiffQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SchemaDiffQuery, SchemaDiffQueryVariables>(SchemaDiffDocument, options);
      }
export function useSchemaDiffLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SchemaDiffQuery, SchemaDiffQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SchemaDiffQuery, SchemaDiffQueryVariables>(SchemaDiffDocument, options);
        }
export type SchemaDiffQueryHookResult = ReturnType<typeof useSchemaDiffQuery>;
export type SchemaDiffLazyQueryHookResult = ReturnType<typeof useSchemaDiffLazyQuery>;
export type SchemaDiffQueryResult = Apollo.QueryResult<SchemaDiffQuery, SchemaDiffQueryVariables>;
export const TableListForSchemasDocument = gql`
    query TableListForSchemas($databaseName: String!, $refName: String!) {
  tables(databaseName: $databaseName, refName: $refName, filterSystemTables: true) {
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
export const RowsForDoltSchemasDocument = gql`
    query RowsForDoltSchemas($databaseName: String!, $refName: String!) {
  doltSchemas(databaseName: $databaseName, refName: $refName) {
    ...SchemaItem
  }
}
    ${SchemaItemFragmentDoc}`;

/**
 * __useRowsForDoltSchemasQuery__
 *
 * To run a query within a React component, call `useRowsForDoltSchemasQuery` and pass it any options that fit your needs.
 * When your component renders, `useRowsForDoltSchemasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRowsForDoltSchemasQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useRowsForDoltSchemasQuery(baseOptions: Apollo.QueryHookOptions<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>(RowsForDoltSchemasDocument, options);
      }
export function useRowsForDoltSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>(RowsForDoltSchemasDocument, options);
        }
export type RowsForDoltSchemasQueryHookResult = ReturnType<typeof useRowsForDoltSchemasQuery>;
export type RowsForDoltSchemasLazyQueryHookResult = ReturnType<typeof useRowsForDoltSchemasLazyQuery>;
export type RowsForDoltSchemasQueryResult = Apollo.QueryResult<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>;
export const RowsForDoltProceduresDocument = gql`
    query RowsForDoltProcedures($databaseName: String!, $refName: String!) {
  doltProcedures(databaseName: $databaseName, refName: $refName) {
    ...SchemaItem
  }
}
    ${SchemaItemFragmentDoc}`;

/**
 * __useRowsForDoltProceduresQuery__
 *
 * To run a query within a React component, call `useRowsForDoltProceduresQuery` and pass it any options that fit your needs.
 * When your component renders, `useRowsForDoltProceduresQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRowsForDoltProceduresQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useRowsForDoltProceduresQuery(baseOptions: Apollo.QueryHookOptions<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>(RowsForDoltProceduresDocument, options);
      }
export function useRowsForDoltProceduresLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>(RowsForDoltProceduresDocument, options);
        }
export type RowsForDoltProceduresQueryHookResult = ReturnType<typeof useRowsForDoltProceduresQuery>;
export type RowsForDoltProceduresLazyQueryHookResult = ReturnType<typeof useRowsForDoltProceduresLazyQuery>;
export type RowsForDoltProceduresQueryResult = Apollo.QueryResult<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>;
export const SqlSelectForSqlDataTableDocument = gql`
    query SqlSelectForSqlDataTable($databaseName: String!, $refName: String!, $queryString: String!) {
  sqlSelect(
    databaseName: $databaseName
    refName: $refName
    queryString: $queryString
  ) {
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
export const GetStatusDocument = gql`
    query GetStatus($databaseName: String!, $refName: String!) {
  status(databaseName: $databaseName, refName: $refName) {
    ...Status
  }
}
    ${StatusFragmentDoc}`;

/**
 * __useGetStatusQuery__
 *
 * To run a query within a React component, call `useGetStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStatusQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useGetStatusQuery(baseOptions: Apollo.QueryHookOptions<GetStatusQuery, GetStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStatusQuery, GetStatusQueryVariables>(GetStatusDocument, options);
      }
export function useGetStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStatusQuery, GetStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStatusQuery, GetStatusQueryVariables>(GetStatusDocument, options);
        }
export type GetStatusQueryHookResult = ReturnType<typeof useGetStatusQuery>;
export type GetStatusLazyQueryHookResult = ReturnType<typeof useGetStatusLazyQuery>;
export type GetStatusQueryResult = Apollo.QueryResult<GetStatusQuery, GetStatusQueryVariables>;
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
    ...SchemaItem
  }
}
    ${SchemaItemFragmentDoc}`;

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
export const AddDatabaseConnectionDocument = gql`
    mutation AddDatabaseConnection($url: String, $useEnv: Boolean, $hideDoltFeatures: Boolean) {
  addDatabaseConnection(
    url: $url
    useEnv: $useEnv
    hideDoltFeatures: $hideDoltFeatures
  )
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
 *      hideDoltFeatures: // value for 'hideDoltFeatures'
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
export const HistoryForCommitDocument = gql`
    query HistoryForCommit($databaseName: String!, $afterCommitId: String!) {
  commits(afterCommitId: $afterCommitId, databaseName: $databaseName) {
    list {
      ...CommitForAfterCommitHistory
    }
  }
}
    ${CommitForAfterCommitHistoryFragmentDoc}`;

/**
 * __useHistoryForCommitQuery__
 *
 * To run a query within a React component, call `useHistoryForCommitQuery` and pass it any options that fit your needs.
 * When your component renders, `useHistoryForCommitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHistoryForCommitQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      afterCommitId: // value for 'afterCommitId'
 *   },
 * });
 */
export function useHistoryForCommitQuery(baseOptions: Apollo.QueryHookOptions<HistoryForCommitQuery, HistoryForCommitQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HistoryForCommitQuery, HistoryForCommitQueryVariables>(HistoryForCommitDocument, options);
      }
export function useHistoryForCommitLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HistoryForCommitQuery, HistoryForCommitQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HistoryForCommitQuery, HistoryForCommitQueryVariables>(HistoryForCommitDocument, options);
        }
export type HistoryForCommitQueryHookResult = ReturnType<typeof useHistoryForCommitQuery>;
export type HistoryForCommitLazyQueryHookResult = ReturnType<typeof useHistoryForCommitLazyQuery>;
export type HistoryForCommitQueryResult = Apollo.QueryResult<HistoryForCommitQuery, HistoryForCommitQueryVariables>;
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
export const DocsRowsForDocPageQueryDocument = gql`
    query DocsRowsForDocPageQuery($databaseName: String!, $refName: String!) {
  docs(databaseName: $databaseName, refName: $refName) {
    ...DocListForDocPage
  }
}
    ${DocListForDocPageFragmentDoc}`;

/**
 * __useDocsRowsForDocPageQuery__
 *
 * To run a query within a React component, call `useDocsRowsForDocPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useDocsRowsForDocPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocsRowsForDocPageQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useDocsRowsForDocPageQuery(baseOptions: Apollo.QueryHookOptions<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>(DocsRowsForDocPageQueryDocument, options);
      }
export function useDocsRowsForDocPageQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>(DocsRowsForDocPageQueryDocument, options);
        }
export type DocsRowsForDocPageQueryHookResult = ReturnType<typeof useDocsRowsForDocPageQuery>;
export type DocsRowsForDocPageQueryLazyQueryHookResult = ReturnType<typeof useDocsRowsForDocPageQueryLazyQuery>;
export type DocsRowsForDocPageQueryQueryResult = Apollo.QueryResult<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>;
export const DocDataForDocPageDocument = gql`
    query DocDataForDocPage($databaseName: String!, $refName: String!, $docType: DocType) {
  docOrDefaultDoc(
    databaseName: $databaseName
    refName: $refName
    docType: $docType
  ) {
    docRow {
      ...DocColumnValuesForDocPage
    }
  }
}
    ${DocColumnValuesForDocPageFragmentDoc}`;

/**
 * __useDocDataForDocPageQuery__
 *
 * To run a query within a React component, call `useDocDataForDocPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useDocDataForDocPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocDataForDocPageQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      docType: // value for 'docType'
 *   },
 * });
 */
export function useDocDataForDocPageQuery(baseOptions: Apollo.QueryHookOptions<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>(DocDataForDocPageDocument, options);
      }
export function useDocDataForDocPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>(DocDataForDocPageDocument, options);
        }
export type DocDataForDocPageQueryHookResult = ReturnType<typeof useDocDataForDocPageQuery>;
export type DocDataForDocPageLazyQueryHookResult = ReturnType<typeof useDocDataForDocPageLazyQuery>;
export type DocDataForDocPageQueryResult = Apollo.QueryResult<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>;
export const DocPageQueryNoBranchDocument = gql`
    query DocPageQueryNoBranch($databaseName: String!) {
  branchOrDefault(databaseName: $databaseName) {
    _id
    branchName
  }
}
    `;

/**
 * __useDocPageQueryNoBranch__
 *
 * To run a query within a React component, call `useDocPageQueryNoBranch` and pass it any options that fit your needs.
 * When your component renders, `useDocPageQueryNoBranch` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocPageQueryNoBranch({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useDocPageQueryNoBranch(baseOptions: Apollo.QueryHookOptions<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>(DocPageQueryNoBranchDocument, options);
      }
export function useDocPageQueryNoBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>(DocPageQueryNoBranchDocument, options);
        }
export type DocPageQueryNoBranchHookResult = ReturnType<typeof useDocPageQueryNoBranch>;
export type DocPageQueryNoBranchLazyQueryHookResult = ReturnType<typeof useDocPageQueryNoBranchLazyQuery>;
export type DocPageQueryNoBranchQueryResult = Apollo.QueryResult<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>;
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
export const CreateTagDocument = gql`
    mutation CreateTag($databaseName: String!, $tagName: String!, $message: String, $fromRefName: String!) {
  createTag(
    databaseName: $databaseName
    tagName: $tagName
    message: $message
    fromRefName: $fromRefName
  ) {
    ...TagForList
  }
}
    ${TagForListFragmentDoc}`;
export type CreateTagMutationFn = Apollo.MutationFunction<CreateTagMutation, CreateTagMutationVariables>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tagName: // value for 'tagName'
 *      message: // value for 'message'
 *      fromRefName: // value for 'fromRefName'
 *   },
 * });
 */
export function useCreateTagMutation(baseOptions?: Apollo.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument, options);
      }
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = Apollo.MutationResult<CreateTagMutation>;
export type CreateTagMutationOptions = Apollo.BaseMutationOptions<CreateTagMutation, CreateTagMutationVariables>;
export const DeleteTagDocument = gql`
    mutation DeleteTag($databaseName: String!, $tagName: String!) {
  deleteTag(databaseName: $databaseName, tagName: $tagName)
}
    `;
export type DeleteTagMutationFn = Apollo.MutationFunction<DeleteTagMutation, DeleteTagMutationVariables>;

/**
 * __useDeleteTagMutation__
 *
 * To run a mutation, you first call `useDeleteTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTagMutation, { data, loading, error }] = useDeleteTagMutation({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      tagName: // value for 'tagName'
 *   },
 * });
 */
export function useDeleteTagMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTagMutation, DeleteTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(DeleteTagDocument, options);
      }
export type DeleteTagMutationHookResult = ReturnType<typeof useDeleteTagMutation>;
export type DeleteTagMutationResult = Apollo.MutationResult<DeleteTagMutation>;
export type DeleteTagMutationOptions = Apollo.BaseMutationOptions<DeleteTagMutation, DeleteTagMutationVariables>;
export const LoadDataDocument = gql`
    mutation LoadData($databaseName: String!, $refName: String!, $tableName: String!, $importOp: ImportOperation!, $fileType: FileType!, $file: Upload!, $modifier: LoadDataModifier) {
  loadDataFile(
    databaseName: $databaseName
    refName: $refName
    tableName: $tableName
    importOp: $importOp
    fileType: $fileType
    file: $file
    modifier: $modifier
  )
}
    `;
export type LoadDataMutationFn = Apollo.MutationFunction<LoadDataMutation, LoadDataMutationVariables>;

/**
 * __useLoadDataMutation__
 *
 * To run a mutation, you first call `useLoadDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoadDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loadDataMutation, { data, loading, error }] = useLoadDataMutation({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      tableName: // value for 'tableName'
 *      importOp: // value for 'importOp'
 *      fileType: // value for 'fileType'
 *      file: // value for 'file'
 *      modifier: // value for 'modifier'
 *   },
 * });
 */
export function useLoadDataMutation(baseOptions?: Apollo.MutationHookOptions<LoadDataMutation, LoadDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoadDataMutation, LoadDataMutationVariables>(LoadDataDocument, options);
      }
export type LoadDataMutationHookResult = ReturnType<typeof useLoadDataMutation>;
export type LoadDataMutationResult = Apollo.MutationResult<LoadDataMutation>;
export type LoadDataMutationOptions = Apollo.BaseMutationOptions<LoadDataMutation, LoadDataMutationVariables>;
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
export const DiffSummariesDocument = gql`
    query DiffSummaries($databaseName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $type: CommitDiffType) {
  diffSummaries(
    databaseName: $databaseName
    fromRefName: $fromRefName
    toRefName: $toRefName
    refName: $refName
    type: $type
  ) {
    ...DiffSummary
  }
}
    ${DiffSummaryFragmentDoc}`;

/**
 * __useDiffSummariesQuery__
 *
 * To run a query within a React component, call `useDiffSummariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiffSummariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiffSummariesQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useDiffSummariesQuery(baseOptions: Apollo.QueryHookOptions<DiffSummariesQuery, DiffSummariesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiffSummariesQuery, DiffSummariesQueryVariables>(DiffSummariesDocument, options);
      }
export function useDiffSummariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiffSummariesQuery, DiffSummariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiffSummariesQuery, DiffSummariesQueryVariables>(DiffSummariesDocument, options);
        }
export type DiffSummariesQueryHookResult = ReturnType<typeof useDiffSummariesQuery>;
export type DiffSummariesLazyQueryHookResult = ReturnType<typeof useDiffSummariesLazyQuery>;
export type DiffSummariesQueryResult = Apollo.QueryResult<DiffSummariesQuery, DiffSummariesQueryVariables>;
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
export const BranchListForCommitGraphDocument = gql`
    query BranchListForCommitGraph($databaseName: String!) {
  branches(databaseName: $databaseName) {
    list {
      ...BranchForCommitGraph
    }
  }
}
    ${BranchForCommitGraphFragmentDoc}`;

/**
 * __useBranchListForCommitGraphQuery__
 *
 * To run a query within a React component, call `useBranchListForCommitGraphQuery` and pass it any options that fit your needs.
 * When your component renders, `useBranchListForCommitGraphQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBranchListForCommitGraphQuery({
 *   variables: {
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useBranchListForCommitGraphQuery(baseOptions: Apollo.QueryHookOptions<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>(BranchListForCommitGraphDocument, options);
      }
export function useBranchListForCommitGraphLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>(BranchListForCommitGraphDocument, options);
        }
export type BranchListForCommitGraphQueryHookResult = ReturnType<typeof useBranchListForCommitGraphQuery>;
export type BranchListForCommitGraphLazyQueryHookResult = ReturnType<typeof useBranchListForCommitGraphLazyQuery>;
export type BranchListForCommitGraphQueryResult = Apollo.QueryResult<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>;
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