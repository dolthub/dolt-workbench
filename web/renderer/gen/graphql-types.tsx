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

export type AuthorInfo = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Branch = {
  __typename?: 'Branch';
  _id: Scalars['ID']['output'];
  branchName: Scalars['String']['output'];
  databaseName: Scalars['String']['output'];
  head?: Maybe<Scalars['String']['output']>;
  lastCommitter: Scalars['String']['output'];
  lastUpdated: Scalars['Timestamp']['output'];
  name: Scalars['String']['output'];
  remote?: Maybe<Scalars['String']['output']>;
  remoteBranch?: Maybe<Scalars['String']['output']>;
  table?: Maybe<Table>;
  tableNames: Array<Scalars['String']['output']>;
};


export type BranchTableArgs = {
  tableName: Scalars['String']['input'];
};


export type BranchTableNamesArgs = {
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
  schemaName?: InputMaybe<Scalars['String']['input']>;
};

export type BranchList = {
  __typename?: 'BranchList';
  list: Array<Branch>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
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

export type CurrentDatabaseState = {
  __typename?: 'CurrentDatabaseState';
  currentDatabase?: Maybe<Scalars['String']['output']>;
};

export type DatabaseConnection = {
  __typename?: 'DatabaseConnection';
  connectionUrl: Scalars['String']['output'];
  hideDoltFeatures?: Maybe<Scalars['Boolean']['output']>;
  isDolt?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  type?: Maybe<DatabaseType>;
  useSSL?: Maybe<Scalars['Boolean']['output']>;
};

export enum DatabaseType {
  Mysql = 'Mysql',
  Postgres = 'Postgres'
}

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
  type: DatabaseType;
};

export type DoltWriter = {
  __typename?: 'DoltWriter';
  _id: Scalars['ID']['output'];
  displayName: Scalars['String']['output'];
  emailAddress: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type FetchRes = {
  __typename?: 'FetchRes';
  success: Scalars['Boolean']['output'];
};

export enum FileType {
  Csv = 'Csv',
  Psv = 'Psv',
  Tsv = 'Tsv'
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
  addDatabaseConnection: CurrentDatabaseState;
  addRemote: Scalars['String']['output'];
  createBranch: Scalars['String']['output'];
  createDatabase: Scalars['Boolean']['output'];
  createSchema: Scalars['Boolean']['output'];
  createTag: Scalars['String']['output'];
  deleteBranch: Scalars['Boolean']['output'];
  deleteRemote: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  loadDataFile: Scalars['Boolean']['output'];
  mergePull: Scalars['Boolean']['output'];
  pullFromRemote: PullRes;
  pushToRemote: PushRes;
  removeDatabaseConnection: Scalars['Boolean']['output'];
  resetDatabase: Scalars['Boolean']['output'];
  restoreAllTables: Scalars['Boolean']['output'];
};


export type MutationAddDatabaseConnectionArgs = {
  connectionUrl: Scalars['String']['input'];
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  type?: InputMaybe<DatabaseType>;
  useSSL?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationAddRemoteArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  remoteName: Scalars['String']['input'];
  remoteUrl: Scalars['String']['input'];
};


export type MutationCreateBranchArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  newBranchName: Scalars['String']['input'];
};


export type MutationCreateDatabaseArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateSchemaArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName: Scalars['String']['input'];
};


export type MutationCreateTagArgs = {
  author?: InputMaybe<AuthorInfo>;
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
};


export type MutationDeleteBranchArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationDeleteRemoteArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  remoteName: Scalars['String']['input'];
};


export type MutationDeleteTagArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
};


export type MutationLoadDataFileArgs = {
  databaseName: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  fileType: FileType;
  importOp: ImportOperation;
  modifier?: InputMaybe<LoadDataModifier>;
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
};


export type MutationMergePullArgs = {
  author?: InputMaybe<AuthorInfo>;
  databaseName: Scalars['String']['input'];
  fromBranchName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  toBranchName: Scalars['String']['input'];
};


export type MutationPullFromRemoteArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  remoteName: Scalars['String']['input'];
};


export type MutationPushToRemoteArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  remoteName: Scalars['String']['input'];
};


export type MutationRemoveDatabaseConnectionArgs = {
  name: Scalars['String']['input'];
};


export type MutationResetDatabaseArgs = {
  newDatabase?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRestoreAllTablesArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};

export type PullDetailCommit = {
  __typename?: 'PullDetailCommit';
  _id: Scalars['ID']['output'];
  commitId: Scalars['String']['output'];
  createdAt: Scalars['Timestamp']['output'];
  message: Scalars['String']['output'];
  parentCommitId?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type PullDetailSummary = {
  __typename?: 'PullDetailSummary';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  numCommits: Scalars['Float']['output'];
  username: Scalars['String']['output'];
};

export type PullDetails = PullDetailCommit | PullDetailSummary;

export type PullRes = {
  __typename?: 'PullRes';
  conflicts: Scalars['Int']['output'];
  fastForward: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
};

export enum PullState {
  Merged = 'Merged',
  Open = 'Open',
  Unspecified = 'Unspecified'
}

export type PullSummary = {
  __typename?: 'PullSummary';
  _id: Scalars['ID']['output'];
  commits: CommitList;
};

export type PullWithDetails = {
  __typename?: 'PullWithDetails';
  _id: Scalars['ID']['output'];
  details?: Maybe<Array<PullDetails>>;
  state: PullState;
  summary?: Maybe<PullSummary>;
};

export type PushRes = {
  __typename?: 'PushRes';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  allBranches: Array<Branch>;
  branch?: Maybe<Branch>;
  branchOrDefault?: Maybe<Branch>;
  branches: BranchList;
  commits: CommitList;
  currentConnection?: Maybe<DatabaseConnection>;
  currentDatabase?: Maybe<Scalars['String']['output']>;
  databases: Array<Scalars['String']['output']>;
  databasesByConnection: Array<Scalars['String']['output']>;
  defaultBranch?: Maybe<Branch>;
  diffStat: DiffStat;
  diffSummaries: Array<DiffSummary>;
  docOrDefaultDoc?: Maybe<Doc>;
  docs: DocList;
  doltDatabaseDetails: DoltDatabaseDetails;
  doltProcedures: Array<SchemaItem>;
  doltSchemas: Array<SchemaItem>;
  fetchRemote: FetchRes;
  pullWithDetails: PullWithDetails;
  remoteBranchDiffCounts: RemoteBranchDiffCounts;
  remoteBranches: BranchList;
  remotes: RemoteList;
  rowDiffs: RowDiffList;
  rows: RowList;
  schemaDiff?: Maybe<SchemaDiff>;
  schemas: Array<Scalars['String']['output']>;
  sqlSelect: SqlSelect;
  sqlSelectForCsvDownload: Scalars['String']['output'];
  status: Array<Status>;
  storedConnections: Array<DatabaseConnection>;
  table: Table;
  tableNames: TableNames;
  tables: Array<Table>;
  tag?: Maybe<Tag>;
  tags: TagList;
  views: Array<SchemaItem>;
};


export type QueryAllBranchesArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortBranchesBy>;
};


export type QueryBranchArgs = {
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type QueryBranchOrDefaultArgs = {
  branchName?: InputMaybe<Scalars['String']['input']>;
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type QueryBranchesArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortBranchesBy>;
};


export type QueryCommitsArgs = {
  afterCommitId?: InputMaybe<Scalars['String']['input']>;
  databaseName: Scalars['String']['input'];
  excludingCommitsFromRefName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName?: InputMaybe<Scalars['String']['input']>;
  twoDot?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryDatabasesArgs = {
  name: Scalars['String']['input'];
};


export type QueryDatabasesByConnectionArgs = {
  connectionUrl: Scalars['String']['input'];
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  type?: InputMaybe<DatabaseType>;
  useSSL?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryDefaultBranchArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type QueryDiffStatArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryDiffSummariesArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryDocOrDefaultDocArgs = {
  databaseName: Scalars['String']['input'];
  docType?: InputMaybe<DocType>;
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryDocsArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryDoltDatabaseDetailsArgs = {
  name: Scalars['String']['input'];
};


export type QueryDoltProceduresArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryDoltSchemasArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFetchRemoteArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  remoteName: Scalars['String']['input'];
};


export type QueryPullWithDetailsArgs = {
  databaseName: Scalars['String']['input'];
  fromBranchName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  toBranchName: Scalars['String']['input'];
};


export type QueryRemoteBranchDiffCountsArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
};


export type QueryRemoteBranchesArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortBranchesBy>;
};


export type QueryRemotesArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRowDiffsArgs = {
  databaseName: Scalars['String']['input'];
  filterByRowType?: InputMaybe<DiffRowType>;
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QueryRowsArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
};


export type QuerySchemaDiffArgs = {
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  type?: InputMaybe<CommitDiffType>;
};


export type QuerySchemasArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QuerySqlSelectArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySqlSelectForCsvDownloadArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStatusArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
};


export type QueryTableArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
};


export type QueryTableNamesArgs = {
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTablesArgs = {
  databaseName: Scalars['String']['input'];
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTagArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
};


export type QueryTagsArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type QueryViewsArgs = {
  databaseName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
};

export enum QueryExecutionStatus {
  Error = 'Error',
  Success = 'Success',
  Timeout = 'Timeout'
}

export type Remote = {
  __typename?: 'Remote';
  _id: Scalars['ID']['output'];
  fetchSpecs?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type RemoteBranchDiffCounts = {
  __typename?: 'RemoteBranchDiffCounts';
  ahead?: Maybe<Scalars['Int']['output']>;
  behind?: Maybe<Scalars['Int']['output']>;
};

export type RemoteList = {
  __typename?: 'RemoteList';
  list: Array<Remote>;
  nextOffset?: Maybe<Scalars['Int']['output']>;
};

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
  warnings?: Maybe<Array<Scalars['String']['output']>>;
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
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type CreateDatabaseMutation = { __typename?: 'Mutation', createDatabase: boolean };

export type CurrentDatabaseQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentDatabaseQuery = { __typename?: 'Query', currentDatabase?: string | null };

export type ResetDatabaseMutationVariables = Exact<{
  newDatabase?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResetDatabaseMutation = { __typename?: 'Mutation', resetDatabase: boolean };

export type CurrentConnectionQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentConnectionQuery = { __typename?: 'Query', currentConnection?: { __typename?: 'DatabaseConnection', connectionUrl: string, name: string, hideDoltFeatures?: boolean | null, useSSL?: boolean | null, type?: DatabaseType | null, isDolt?: boolean | null } | null };

export type DatabasesByConnectionQueryVariables = Exact<{
  connectionUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
  useSSL?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<DatabaseType>;
}>;


export type DatabasesByConnectionQuery = { __typename?: 'Query', databasesByConnection: Array<string> };

export type GetTagQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
}>;


export type GetTagQuery = { __typename?: 'Query', tag?: { __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } } | null };

export type GetBranchQueryVariables = Exact<{
  name: Scalars['String']['input'];
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type GetBranchQuery = { __typename?: 'Query', branch?: { __typename?: 'Branch', _id: string } | null };

export type SqlSelectForCsvDownloadQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  queryString: Scalars['String']['input'];
}>;


export type SqlSelectForCsvDownloadQuery = { __typename?: 'Query', sqlSelectForCsvDownload: string };

export type DatabasesQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type DatabasesQuery = { __typename?: 'Query', databases: Array<string> };

export type SchemaItemFragment = { __typename?: 'SchemaItem', name: string, type: SchemaType };

export type RowsForDoltSchemasQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
}>;


export type RowsForDoltSchemasQuery = { __typename?: 'Query', doltSchemas: Array<{ __typename?: 'SchemaItem', name: string, type: SchemaType }> };

export type RowsForDoltProceduresQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type RowsForDoltProceduresQuery = { __typename?: 'Query', doltProcedures: Array<{ __typename?: 'SchemaItem', name: string, type: SchemaType }> };

export type CommitForDiffSelectorFragment = { __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } };

export type CommitListForDiffSelectorFragment = { __typename?: 'CommitList', list: Array<{ __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } }> };

export type CommitsForDiffSelectorQueryVariables = Exact<{
  name: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type CommitsForDiffSelectorQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', list: Array<{ __typename?: 'Commit', _id: string, commitId: string, message: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, displayName: string, username?: string | null } }> } };

export type DiffStatForDiffsFragment = { __typename?: 'DiffStat', rowsUnmodified: number, rowsAdded: number, rowsDeleted: number, rowsModified: number, cellsModified: number, rowCount: number, cellCount: number };

export type DiffStatQueryVariables = Exact<{
  name: Scalars['String']['input'];
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
  name: Scalars['String']['input'];
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
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
  toRefName: Scalars['String']['input'];
  refName?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CommitDiffType>;
}>;


export type SchemaDiffQuery = { __typename?: 'Query', schemaDiff?: { __typename?: 'SchemaDiff', schemaPatch?: Array<string> | null, schemaDiff?: { __typename?: 'TextDiff', leftLines: string, rightLines: string } | null } | null };

export type BranchForBranchSelectorFragment = { __typename?: 'Branch', branchName: string, databaseName: string, remote?: string | null, remoteBranch?: string | null };

export type BranchesForSelectorQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type BranchesForSelectorQuery = { __typename?: 'Query', allBranches: Array<{ __typename?: 'Branch', branchName: string, databaseName: string, remote?: string | null, remoteBranch?: string | null }> };

export type TagForListFragment = { __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } };

export type TagListForTagListFragment = { __typename?: 'TagList', list: Array<{ __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> };

export type TagListQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type TagListQuery = { __typename?: 'Query', tags: { __typename?: 'TagList', list: Array<{ __typename?: 'Tag', _id: string, tagName: string, message: string, taggedAt: any, commitId: string, tagger: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> } };

export type TableNamesForBranchQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
}>;


export type TableNamesForBranchQuery = { __typename?: 'Query', tableNames: { __typename?: 'TableNames', list: Array<string> } };

export type ColumnsListForTableListFragment = { __typename?: 'IndexColumn', name: string, sqlType?: string | null };

export type IndexForTableListFragment = { __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> };

export type TableForSchemaListFragment = { __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> };

export type TableListForSchemasQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
}>;


export type TableListForSchemasQuery = { __typename?: 'Query', tables: Array<{ __typename?: 'Table', _id: string, tableName: string, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }>, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, indexes: Array<{ __typename?: 'Index', name: string, type: string, comment: string, columns: Array<{ __typename?: 'IndexColumn', name: string, sqlType?: string | null }> }> }> };

export type DatabaseSchemasQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type DatabaseSchemasQuery = { __typename?: 'Query', schemas: Array<string> };

export type CreateSchemaMutationVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  schemaName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type CreateSchemaMutation = { __typename?: 'Mutation', createSchema: boolean };

export type ColumnForTableListFragment = { __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type TableWithColumnsFragment = { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> };

export type TableForBranchQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
}>;


export type TableForBranchQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, tableName: string, columns: Array<{ __typename?: 'Column', name: string, type: string, isPrimaryKey: boolean, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }> } };

export type AddDatabaseConnectionMutationVariables = Exact<{
  connectionUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
  hideDoltFeatures?: InputMaybe<Scalars['Boolean']['input']>;
  useSSL?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<DatabaseType>;
}>;


export type AddDatabaseConnectionMutation = { __typename?: 'Mutation', addDatabaseConnection: { __typename?: 'CurrentDatabaseState', currentDatabase?: string | null } };

export type DatabaseConnectionFragment = { __typename?: 'DatabaseConnection', connectionUrl: string, name: string, useSSL?: boolean | null, hideDoltFeatures?: boolean | null, type?: DatabaseType | null, isDolt?: boolean | null };

export type StoredConnectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type StoredConnectionsQuery = { __typename?: 'Query', storedConnections: Array<{ __typename?: 'DatabaseConnection', connectionUrl: string, name: string, useSSL?: boolean | null, hideDoltFeatures?: boolean | null, type?: DatabaseType | null, isDolt?: boolean | null }> };

export type RemoveConnectionMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type RemoveConnectionMutation = { __typename?: 'Mutation', removeDatabaseConnection: boolean };

export type BranchFragment = { __typename?: 'Branch', _id: string, branchName: string, databaseName: string, lastUpdated: any, lastCommitter: string };

export type BranchListQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  sortBy?: InputMaybe<SortBranchesBy>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BranchListQuery = { __typename?: 'Query', branches: { __typename?: 'BranchList', nextOffset?: number | null, list: Array<{ __typename?: 'Branch', _id: string, branchName: string, databaseName: string, lastUpdated: any, lastCommitter: string }> } };

export type RemoteBranchesQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  sortBy?: InputMaybe<SortBranchesBy>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RemoteBranchesQuery = { __typename?: 'Query', remoteBranches: { __typename?: 'BranchList', nextOffset?: number | null, list: Array<{ __typename?: 'Branch', _id: string, branchName: string, databaseName: string, lastUpdated: any, lastCommitter: string }> } };

export type DeleteBranchMutationVariables = Exact<{
  name: Scalars['String']['input'];
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type DeleteBranchMutation = { __typename?: 'Mutation', deleteBranch: boolean };

export type CreateBranchMutationVariables = Exact<{
  name: Scalars['String']['input'];
  newBranchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  fromRefName: Scalars['String']['input'];
}>;


export type CreateBranchMutation = { __typename?: 'Mutation', createBranch: string };

export type DocRowForDocPageFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type DocForDocPageFragment = { __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null };

export type DocListForDocPageFragment = { __typename?: 'DocList', list: Array<{ __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }> };

export type DocsRowsForDocPageQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
}>;


export type DocsRowsForDocPageQuery = { __typename?: 'Query', docs: { __typename?: 'DocList', list: Array<{ __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null }> } };

export type DocColumnValuesForDocPageFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type DocDataForDocPageQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  docType?: InputMaybe<DocType>;
}>;


export type DocDataForDocPageQuery = { __typename?: 'Query', docOrDefaultDoc?: { __typename?: 'Doc', docRow?: { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> } | null } | null };

export type DocPageQueryNoBranchQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type DocPageQueryNoBranchQuery = { __typename?: 'Query', branchOrDefault?: { __typename?: 'Branch', _id: string, branchName: string } | null };

export type GetBranchForPullQueryVariables = Exact<{
  name: Scalars['String']['input'];
  branchName: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
}>;


export type GetBranchForPullQuery = { __typename?: 'Query', branch?: { __typename?: 'Branch', _id: string } | null };

export type MergePullMutationVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  fromBranchName: Scalars['String']['input'];
  toBranchName: Scalars['String']['input'];
  author?: InputMaybe<AuthorInfo>;
}>;


export type MergePullMutation = { __typename?: 'Mutation', mergePull: boolean };

export type CreateTagMutationVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  tagName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  fromRefName: Scalars['String']['input'];
  author?: InputMaybe<AuthorInfo>;
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag: string };

export type LoadDataMutationVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  importOp: ImportOperation;
  fileType: FileType;
  file: Scalars['Upload']['input'];
  modifier?: InputMaybe<LoadDataModifier>;
}>;


export type LoadDataMutation = { __typename?: 'Mutation', loadDataFile: boolean };

export type DoltDatabaseDetailsQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type DoltDatabaseDetailsQuery = { __typename?: 'Query', doltDatabaseDetails: { __typename?: 'DoltDatabaseDetails', isDolt: boolean, hideDoltFeatures: boolean, type: DatabaseType } };

export type ColumnForDataTableFragment = { __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null };

export type ForeignKeyColumnForDataTableFragment = { __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number };

export type ForeignKeysForDataTableFragment = { __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> };

export type DataTableQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
}>;


export type DataTableQuery = { __typename?: 'Query', table: { __typename?: 'Table', _id: string, columns: Array<{ __typename?: 'Column', name: string, isPrimaryKey: boolean, type: string, sourceTable?: string | null, constraints?: Array<{ __typename?: 'ColConstraint', notNull: boolean }> | null }>, foreignKeys: Array<{ __typename?: 'ForeignKey', tableName: string, columnName: string, referencedTableName: string, foreignKeyColumn: Array<{ __typename?: 'ForeignKeyColumn', referencedColumnName: string, referrerColumnIndex: number }> }> } };

export type RowForDataTableFragment = { __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> };

export type RowListRowsFragment = { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> };

export type RowsForDataTableQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RowsForDataTableQuery = { __typename?: 'Query', rows: { __typename?: 'RowList', nextOffset?: number | null, list: Array<{ __typename?: 'Row', columnValues: Array<{ __typename?: 'ColumnValue', displayValue: string }> }> } };

export type DiffSummaryFragment = { __typename?: 'DiffSummary', _id: string, fromTableName: string, toTableName: string, tableName: string, tableType: TableDiffType, hasDataChanges: boolean, hasSchemaChanges: boolean };

export type DiffSummariesQueryVariables = Exact<{
  name: Scalars['String']['input'];
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
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HistoryForBranchQuery = { __typename?: 'Query', commits: { __typename?: 'CommitList', nextOffset?: number | null, list: Array<{ __typename?: 'Commit', _id: string, message: string, commitId: string, committedAt: any, parents: Array<string>, committer: { __typename?: 'DoltWriter', _id: string, username?: string | null, displayName: string, emailAddress: string } }> } };

export type BranchForCommitGraphFragment = { __typename?: 'Branch', branchName: string, head?: string | null };

export type BranchListForCommitGraphQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BranchListForCommitGraphQuery = { __typename?: 'Query', branches: { __typename?: 'BranchList', nextOffset?: number | null, list: Array<{ __typename?: 'Branch', branchName: string, head?: string | null }> } };

export type TableNamesQueryVariables = Exact<{
  name: Scalars['String']['input'];
  databaseName: Scalars['String']['input'];
  refName: Scalars['String']['input'];
  schemaName?: InputMaybe<Scalars['String']['input']>;
  filterSystemTables?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type TableNamesQuery = { __typename?: 'Query', tableNames: { __typename?: 'TableNames', list: Array<string> } };

export const SchemaItemFragmentDoc = gql`
    fragment SchemaItem on SchemaItem {
  name
  type
}
    `;
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
export const BranchForBranchSelectorFragmentDoc = gql`
    fragment BranchForBranchSelector on Branch {
  branchName
  databaseName
  remote
  remoteBranch
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
export const TableWithColumnsFragmentDoc = gql`
    fragment TableWithColumns on Table {
  _id
  tableName
  columns {
    ...ColumnForTableList
  }
}
    ${ColumnForTableListFragmentDoc}`;
export const DatabaseConnectionFragmentDoc = gql`
    fragment DatabaseConnection on DatabaseConnection {
  connectionUrl
  name
  useSSL
  hideDoltFeatures
  type
  isDolt
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
    mutation CreateDatabase($name: String!, $databaseName: String!) {
  createDatabase(name: $name, databaseName: $databaseName)
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
 *      name: // value for 'name'
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
export function useCurrentDatabaseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>(CurrentDatabaseDocument, options);
        }
export type CurrentDatabaseQueryHookResult = ReturnType<typeof useCurrentDatabaseQuery>;
export type CurrentDatabaseLazyQueryHookResult = ReturnType<typeof useCurrentDatabaseLazyQuery>;
export type CurrentDatabaseSuspenseQueryHookResult = ReturnType<typeof useCurrentDatabaseSuspenseQuery>;
export type CurrentDatabaseQueryResult = Apollo.QueryResult<CurrentDatabaseQuery, CurrentDatabaseQueryVariables>;
export const ResetDatabaseDocument = gql`
    mutation ResetDatabase($newDatabase: String) {
  resetDatabase(newDatabase: $newDatabase)
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
 *      newDatabase: // value for 'newDatabase'
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
export const CurrentConnectionDocument = gql`
    query CurrentConnection {
  currentConnection {
    connectionUrl
    name
    hideDoltFeatures
    useSSL
    type
    isDolt
  }
}
    `;

/**
 * __useCurrentConnectionQuery__
 *
 * To run a query within a React component, call `useCurrentConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentConnectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentConnectionQuery(baseOptions?: Apollo.QueryHookOptions<CurrentConnectionQuery, CurrentConnectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentConnectionQuery, CurrentConnectionQueryVariables>(CurrentConnectionDocument, options);
      }
export function useCurrentConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentConnectionQuery, CurrentConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentConnectionQuery, CurrentConnectionQueryVariables>(CurrentConnectionDocument, options);
        }
export function useCurrentConnectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentConnectionQuery, CurrentConnectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentConnectionQuery, CurrentConnectionQueryVariables>(CurrentConnectionDocument, options);
        }
export type CurrentConnectionQueryHookResult = ReturnType<typeof useCurrentConnectionQuery>;
export type CurrentConnectionLazyQueryHookResult = ReturnType<typeof useCurrentConnectionLazyQuery>;
export type CurrentConnectionSuspenseQueryHookResult = ReturnType<typeof useCurrentConnectionSuspenseQuery>;
export type CurrentConnectionQueryResult = Apollo.QueryResult<CurrentConnectionQuery, CurrentConnectionQueryVariables>;
export const DatabasesByConnectionDocument = gql`
    query DatabasesByConnection($connectionUrl: String!, $name: String!, $hideDoltFeatures: Boolean, $useSSL: Boolean, $type: DatabaseType) {
  databasesByConnection(
    connectionUrl: $connectionUrl
    name: $name
    hideDoltFeatures: $hideDoltFeatures
    useSSL: $useSSL
    type: $type
  )
}
    `;

/**
 * __useDatabasesByConnectionQuery__
 *
 * To run a query within a React component, call `useDatabasesByConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatabasesByConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatabasesByConnectionQuery({
 *   variables: {
 *      connectionUrl: // value for 'connectionUrl'
 *      name: // value for 'name'
 *      hideDoltFeatures: // value for 'hideDoltFeatures'
 *      useSSL: // value for 'useSSL'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useDatabasesByConnectionQuery(baseOptions: Apollo.QueryHookOptions<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables> & ({ variables: DatabasesByConnectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>(DatabasesByConnectionDocument, options);
      }
export function useDatabasesByConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>(DatabasesByConnectionDocument, options);
        }
export function useDatabasesByConnectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>(DatabasesByConnectionDocument, options);
        }
export type DatabasesByConnectionQueryHookResult = ReturnType<typeof useDatabasesByConnectionQuery>;
export type DatabasesByConnectionLazyQueryHookResult = ReturnType<typeof useDatabasesByConnectionLazyQuery>;
export type DatabasesByConnectionSuspenseQueryHookResult = ReturnType<typeof useDatabasesByConnectionSuspenseQuery>;
export type DatabasesByConnectionQueryResult = Apollo.QueryResult<DatabasesByConnectionQuery, DatabasesByConnectionQueryVariables>;
export const GetTagDocument = gql`
    query GetTag($name: String!, $databaseName: String!, $tagName: String!) {
  tag(name: $name, databaseName: $databaseName, tagName: $tagName) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      tagName: // value for 'tagName'
 *   },
 * });
 */
export function useGetTagQuery(baseOptions: Apollo.QueryHookOptions<GetTagQuery, GetTagQueryVariables> & ({ variables: GetTagQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
      }
export function useGetTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
        }
export function useGetTagSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
        }
export type GetTagQueryHookResult = ReturnType<typeof useGetTagQuery>;
export type GetTagLazyQueryHookResult = ReturnType<typeof useGetTagLazyQuery>;
export type GetTagSuspenseQueryHookResult = ReturnType<typeof useGetTagSuspenseQuery>;
export type GetTagQueryResult = Apollo.QueryResult<GetTagQuery, GetTagQueryVariables>;
export const GetBranchDocument = gql`
    query GetBranch($name: String!, $branchName: String!, $databaseName: String!) {
  branch(name: $name, branchName: $branchName, databaseName: $databaseName) {
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
 *      name: // value for 'name'
 *      branchName: // value for 'branchName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useGetBranchQuery(baseOptions: Apollo.QueryHookOptions<GetBranchQuery, GetBranchQueryVariables> & ({ variables: GetBranchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, options);
      }
export function useGetBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBranchQuery, GetBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, options);
        }
export function useGetBranchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBranchQuery, GetBranchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, options);
        }
export type GetBranchQueryHookResult = ReturnType<typeof useGetBranchQuery>;
export type GetBranchLazyQueryHookResult = ReturnType<typeof useGetBranchLazyQuery>;
export type GetBranchSuspenseQueryHookResult = ReturnType<typeof useGetBranchSuspenseQuery>;
export type GetBranchQueryResult = Apollo.QueryResult<GetBranchQuery, GetBranchQueryVariables>;
export const SqlSelectForCsvDownloadDocument = gql`
    query SqlSelectForCsvDownload($name: String!, $databaseName: String!, $refName: String!, $queryString: String!) {
  sqlSelectForCsvDownload(
    name: $name
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      queryString: // value for 'queryString'
 *   },
 * });
 */
export function useSqlSelectForCsvDownloadQuery(baseOptions: Apollo.QueryHookOptions<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables> & ({ variables: SqlSelectForCsvDownloadQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>(SqlSelectForCsvDownloadDocument, options);
      }
export function useSqlSelectForCsvDownloadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>(SqlSelectForCsvDownloadDocument, options);
        }
export function useSqlSelectForCsvDownloadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>(SqlSelectForCsvDownloadDocument, options);
        }
export type SqlSelectForCsvDownloadQueryHookResult = ReturnType<typeof useSqlSelectForCsvDownloadQuery>;
export type SqlSelectForCsvDownloadLazyQueryHookResult = ReturnType<typeof useSqlSelectForCsvDownloadLazyQuery>;
export type SqlSelectForCsvDownloadSuspenseQueryHookResult = ReturnType<typeof useSqlSelectForCsvDownloadSuspenseQuery>;
export type SqlSelectForCsvDownloadQueryResult = Apollo.QueryResult<SqlSelectForCsvDownloadQuery, SqlSelectForCsvDownloadQueryVariables>;
export const DatabasesDocument = gql`
    query Databases($name: String!) {
  databases(name: $name)
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
 *      name: // value for 'name'
 *   },
 * });
 */
export function useDatabasesQuery(baseOptions: Apollo.QueryHookOptions<DatabasesQuery, DatabasesQueryVariables> & ({ variables: DatabasesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatabasesQuery, DatabasesQueryVariables>(DatabasesDocument, options);
      }
export function useDatabasesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatabasesQuery, DatabasesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatabasesQuery, DatabasesQueryVariables>(DatabasesDocument, options);
        }
export function useDatabasesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DatabasesQuery, DatabasesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DatabasesQuery, DatabasesQueryVariables>(DatabasesDocument, options);
        }
export type DatabasesQueryHookResult = ReturnType<typeof useDatabasesQuery>;
export type DatabasesLazyQueryHookResult = ReturnType<typeof useDatabasesLazyQuery>;
export type DatabasesSuspenseQueryHookResult = ReturnType<typeof useDatabasesSuspenseQuery>;
export type DatabasesQueryResult = Apollo.QueryResult<DatabasesQuery, DatabasesQueryVariables>;
export const RowsForDoltSchemasDocument = gql`
    query RowsForDoltSchemas($name: String!, $databaseName: String!, $refName: String!, $schemaName: String) {
  doltSchemas(
    name: $name
    databaseName: $databaseName
    refName: $refName
    schemaName: $schemaName
  ) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      schemaName: // value for 'schemaName'
 *   },
 * });
 */
export function useRowsForDoltSchemasQuery(baseOptions: Apollo.QueryHookOptions<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables> & ({ variables: RowsForDoltSchemasQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>(RowsForDoltSchemasDocument, options);
      }
export function useRowsForDoltSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>(RowsForDoltSchemasDocument, options);
        }
export function useRowsForDoltSchemasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>(RowsForDoltSchemasDocument, options);
        }
export type RowsForDoltSchemasQueryHookResult = ReturnType<typeof useRowsForDoltSchemasQuery>;
export type RowsForDoltSchemasLazyQueryHookResult = ReturnType<typeof useRowsForDoltSchemasLazyQuery>;
export type RowsForDoltSchemasSuspenseQueryHookResult = ReturnType<typeof useRowsForDoltSchemasSuspenseQuery>;
export type RowsForDoltSchemasQueryResult = Apollo.QueryResult<RowsForDoltSchemasQuery, RowsForDoltSchemasQueryVariables>;
export const RowsForDoltProceduresDocument = gql`
    query RowsForDoltProcedures($name: String!, $databaseName: String!, $refName: String!) {
  doltProcedures(name: $name, databaseName: $databaseName, refName: $refName) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useRowsForDoltProceduresQuery(baseOptions: Apollo.QueryHookOptions<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables> & ({ variables: RowsForDoltProceduresQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>(RowsForDoltProceduresDocument, options);
      }
export function useRowsForDoltProceduresLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>(RowsForDoltProceduresDocument, options);
        }
export function useRowsForDoltProceduresSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>(RowsForDoltProceduresDocument, options);
        }
export type RowsForDoltProceduresQueryHookResult = ReturnType<typeof useRowsForDoltProceduresQuery>;
export type RowsForDoltProceduresLazyQueryHookResult = ReturnType<typeof useRowsForDoltProceduresLazyQuery>;
export type RowsForDoltProceduresSuspenseQueryHookResult = ReturnType<typeof useRowsForDoltProceduresSuspenseQuery>;
export type RowsForDoltProceduresQueryResult = Apollo.QueryResult<RowsForDoltProceduresQuery, RowsForDoltProceduresQueryVariables>;
export const CommitsForDiffSelectorDocument = gql`
    query CommitsForDiffSelector($name: String!, $refName: String!, $databaseName: String!) {
  commits(refName: $refName, name: $name, databaseName: $databaseName) {
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
 *      name: // value for 'name'
 *      refName: // value for 'refName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useCommitsForDiffSelectorQuery(baseOptions: Apollo.QueryHookOptions<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables> & ({ variables: CommitsForDiffSelectorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>(CommitsForDiffSelectorDocument, options);
      }
export function useCommitsForDiffSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>(CommitsForDiffSelectorDocument, options);
        }
export function useCommitsForDiffSelectorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>(CommitsForDiffSelectorDocument, options);
        }
export type CommitsForDiffSelectorQueryHookResult = ReturnType<typeof useCommitsForDiffSelectorQuery>;
export type CommitsForDiffSelectorLazyQueryHookResult = ReturnType<typeof useCommitsForDiffSelectorLazyQuery>;
export type CommitsForDiffSelectorSuspenseQueryHookResult = ReturnType<typeof useCommitsForDiffSelectorSuspenseQuery>;
export type CommitsForDiffSelectorQueryResult = Apollo.QueryResult<CommitsForDiffSelectorQuery, CommitsForDiffSelectorQueryVariables>;
export const DiffStatDocument = gql`
    query DiffStat($name: String!, $databaseName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $type: CommitDiffType, $tableName: String) {
  diffStat(
    name: $name
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      type: // value for 'type'
 *      tableName: // value for 'tableName'
 *   },
 * });
 */
export function useDiffStatQuery(baseOptions: Apollo.QueryHookOptions<DiffStatQuery, DiffStatQueryVariables> & ({ variables: DiffStatQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiffStatQuery, DiffStatQueryVariables>(DiffStatDocument, options);
      }
export function useDiffStatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiffStatQuery, DiffStatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiffStatQuery, DiffStatQueryVariables>(DiffStatDocument, options);
        }
export function useDiffStatSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DiffStatQuery, DiffStatQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DiffStatQuery, DiffStatQueryVariables>(DiffStatDocument, options);
        }
export type DiffStatQueryHookResult = ReturnType<typeof useDiffStatQuery>;
export type DiffStatLazyQueryHookResult = ReturnType<typeof useDiffStatLazyQuery>;
export type DiffStatSuspenseQueryHookResult = ReturnType<typeof useDiffStatSuspenseQuery>;
export type DiffStatQueryResult = Apollo.QueryResult<DiffStatQuery, DiffStatQueryVariables>;
export const RowDiffsDocument = gql`
    query RowDiffs($name: String!, $databaseName: String!, $tableName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $offset: Int, $filterByRowType: DiffRowType, $type: CommitDiffType) {
  rowDiffs(
    name: $name
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
 *      name: // value for 'name'
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
export function useRowDiffsQuery(baseOptions: Apollo.QueryHookOptions<RowDiffsQuery, RowDiffsQueryVariables> & ({ variables: RowDiffsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowDiffsQuery, RowDiffsQueryVariables>(RowDiffsDocument, options);
      }
export function useRowDiffsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowDiffsQuery, RowDiffsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowDiffsQuery, RowDiffsQueryVariables>(RowDiffsDocument, options);
        }
export function useRowDiffsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RowDiffsQuery, RowDiffsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RowDiffsQuery, RowDiffsQueryVariables>(RowDiffsDocument, options);
        }
export type RowDiffsQueryHookResult = ReturnType<typeof useRowDiffsQuery>;
export type RowDiffsLazyQueryHookResult = ReturnType<typeof useRowDiffsLazyQuery>;
export type RowDiffsSuspenseQueryHookResult = ReturnType<typeof useRowDiffsSuspenseQuery>;
export type RowDiffsQueryResult = Apollo.QueryResult<RowDiffsQuery, RowDiffsQueryVariables>;
export const SchemaDiffDocument = gql`
    query SchemaDiff($name: String!, $databaseName: String!, $tableName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $type: CommitDiffType) {
  schemaDiff(
    name: $name
    databaseName: $databaseName
    tableName: $tableName
    fromRefName: $fromRefName
    toRefName: $toRefName
    refName: $refName
    type: $type
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      tableName: // value for 'tableName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useSchemaDiffQuery(baseOptions: Apollo.QueryHookOptions<SchemaDiffQuery, SchemaDiffQueryVariables> & ({ variables: SchemaDiffQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SchemaDiffQuery, SchemaDiffQueryVariables>(SchemaDiffDocument, options);
      }
export function useSchemaDiffLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SchemaDiffQuery, SchemaDiffQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SchemaDiffQuery, SchemaDiffQueryVariables>(SchemaDiffDocument, options);
        }
export function useSchemaDiffSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SchemaDiffQuery, SchemaDiffQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SchemaDiffQuery, SchemaDiffQueryVariables>(SchemaDiffDocument, options);
        }
export type SchemaDiffQueryHookResult = ReturnType<typeof useSchemaDiffQuery>;
export type SchemaDiffLazyQueryHookResult = ReturnType<typeof useSchemaDiffLazyQuery>;
export type SchemaDiffSuspenseQueryHookResult = ReturnType<typeof useSchemaDiffSuspenseQuery>;
export type SchemaDiffQueryResult = Apollo.QueryResult<SchemaDiffQuery, SchemaDiffQueryVariables>;
export const BranchesForSelectorDocument = gql`
    query BranchesForSelector($name: String!, $databaseName: String!) {
  allBranches(name: $name, databaseName: $databaseName) {
    ...BranchForBranchSelector
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useBranchesForSelectorQuery(baseOptions: Apollo.QueryHookOptions<BranchesForSelectorQuery, BranchesForSelectorQueryVariables> & ({ variables: BranchesForSelectorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>(BranchesForSelectorDocument, options);
      }
export function useBranchesForSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>(BranchesForSelectorDocument, options);
        }
export function useBranchesForSelectorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>(BranchesForSelectorDocument, options);
        }
export type BranchesForSelectorQueryHookResult = ReturnType<typeof useBranchesForSelectorQuery>;
export type BranchesForSelectorLazyQueryHookResult = ReturnType<typeof useBranchesForSelectorLazyQuery>;
export type BranchesForSelectorSuspenseQueryHookResult = ReturnType<typeof useBranchesForSelectorSuspenseQuery>;
export type BranchesForSelectorQueryResult = Apollo.QueryResult<BranchesForSelectorQuery, BranchesForSelectorQueryVariables>;
export const TagListDocument = gql`
    query TagList($name: String!, $databaseName: String!) {
  tags(name: $name, databaseName: $databaseName) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useTagListQuery(baseOptions: Apollo.QueryHookOptions<TagListQuery, TagListQueryVariables> & ({ variables: TagListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TagListQuery, TagListQueryVariables>(TagListDocument, options);
      }
export function useTagListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TagListQuery, TagListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TagListQuery, TagListQueryVariables>(TagListDocument, options);
        }
export function useTagListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TagListQuery, TagListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TagListQuery, TagListQueryVariables>(TagListDocument, options);
        }
export type TagListQueryHookResult = ReturnType<typeof useTagListQuery>;
export type TagListLazyQueryHookResult = ReturnType<typeof useTagListLazyQuery>;
export type TagListSuspenseQueryHookResult = ReturnType<typeof useTagListSuspenseQuery>;
export type TagListQueryResult = Apollo.QueryResult<TagListQuery, TagListQueryVariables>;
export const TableNamesForBranchDocument = gql`
    query TableNamesForBranch($name: String!, $databaseName: String!, $refName: String!, $schemaName: String) {
  tableNames(
    name: $name
    databaseName: $databaseName
    refName: $refName
    schemaName: $schemaName
    filterSystemTables: true
  ) {
    list
  }
}
    `;

/**
 * __useTableNamesForBranchQuery__
 *
 * To run a query within a React component, call `useTableNamesForBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useTableNamesForBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTableNamesForBranchQuery({
 *   variables: {
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      schemaName: // value for 'schemaName'
 *   },
 * });
 */
export function useTableNamesForBranchQuery(baseOptions: Apollo.QueryHookOptions<TableNamesForBranchQuery, TableNamesForBranchQueryVariables> & ({ variables: TableNamesForBranchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>(TableNamesForBranchDocument, options);
      }
export function useTableNamesForBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>(TableNamesForBranchDocument, options);
        }
export function useTableNamesForBranchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>(TableNamesForBranchDocument, options);
        }
export type TableNamesForBranchQueryHookResult = ReturnType<typeof useTableNamesForBranchQuery>;
export type TableNamesForBranchLazyQueryHookResult = ReturnType<typeof useTableNamesForBranchLazyQuery>;
export type TableNamesForBranchSuspenseQueryHookResult = ReturnType<typeof useTableNamesForBranchSuspenseQuery>;
export type TableNamesForBranchQueryResult = Apollo.QueryResult<TableNamesForBranchQuery, TableNamesForBranchQueryVariables>;
export const TableListForSchemasDocument = gql`
    query TableListForSchemas($name: String!, $databaseName: String!, $refName: String!, $schemaName: String) {
  tables(
    name: $name
    databaseName: $databaseName
    refName: $refName
    schemaName: $schemaName
    filterSystemTables: true
  ) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      schemaName: // value for 'schemaName'
 *   },
 * });
 */
export function useTableListForSchemasQuery(baseOptions: Apollo.QueryHookOptions<TableListForSchemasQuery, TableListForSchemasQueryVariables> & ({ variables: TableListForSchemasQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableListForSchemasQuery, TableListForSchemasQueryVariables>(TableListForSchemasDocument, options);
      }
export function useTableListForSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableListForSchemasQuery, TableListForSchemasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableListForSchemasQuery, TableListForSchemasQueryVariables>(TableListForSchemasDocument, options);
        }
export function useTableListForSchemasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TableListForSchemasQuery, TableListForSchemasQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TableListForSchemasQuery, TableListForSchemasQueryVariables>(TableListForSchemasDocument, options);
        }
export type TableListForSchemasQueryHookResult = ReturnType<typeof useTableListForSchemasQuery>;
export type TableListForSchemasLazyQueryHookResult = ReturnType<typeof useTableListForSchemasLazyQuery>;
export type TableListForSchemasSuspenseQueryHookResult = ReturnType<typeof useTableListForSchemasSuspenseQuery>;
export type TableListForSchemasQueryResult = Apollo.QueryResult<TableListForSchemasQuery, TableListForSchemasQueryVariables>;
export const DatabaseSchemasDocument = gql`
    query DatabaseSchemas($name: String!, $databaseName: String!, $refName: String!) {
  schemas(name: $name, databaseName: $databaseName, refName: $refName)
}
    `;

/**
 * __useDatabaseSchemasQuery__
 *
 * To run a query within a React component, call `useDatabaseSchemasQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatabaseSchemasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatabaseSchemasQuery({
 *   variables: {
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useDatabaseSchemasQuery(baseOptions: Apollo.QueryHookOptions<DatabaseSchemasQuery, DatabaseSchemasQueryVariables> & ({ variables: DatabaseSchemasQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>(DatabaseSchemasDocument, options);
      }
export function useDatabaseSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>(DatabaseSchemasDocument, options);
        }
export function useDatabaseSchemasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>(DatabaseSchemasDocument, options);
        }
export type DatabaseSchemasQueryHookResult = ReturnType<typeof useDatabaseSchemasQuery>;
export type DatabaseSchemasLazyQueryHookResult = ReturnType<typeof useDatabaseSchemasLazyQuery>;
export type DatabaseSchemasSuspenseQueryHookResult = ReturnType<typeof useDatabaseSchemasSuspenseQuery>;
export type DatabaseSchemasQueryResult = Apollo.QueryResult<DatabaseSchemasQuery, DatabaseSchemasQueryVariables>;
export const CreateSchemaDocument = gql`
    mutation CreateSchema($name: String!, $databaseName: String!, $schemaName: String!, $refName: String!) {
  createSchema(
    name: $name
    databaseName: $databaseName
    schemaName: $schemaName
    refName: $refName
  )
}
    `;
export type CreateSchemaMutationFn = Apollo.MutationFunction<CreateSchemaMutation, CreateSchemaMutationVariables>;

/**
 * __useCreateSchemaMutation__
 *
 * To run a mutation, you first call `useCreateSchemaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSchemaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSchemaMutation, { data, loading, error }] = useCreateSchemaMutation({
 *   variables: {
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      schemaName: // value for 'schemaName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useCreateSchemaMutation(baseOptions?: Apollo.MutationHookOptions<CreateSchemaMutation, CreateSchemaMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSchemaMutation, CreateSchemaMutationVariables>(CreateSchemaDocument, options);
      }
export type CreateSchemaMutationHookResult = ReturnType<typeof useCreateSchemaMutation>;
export type CreateSchemaMutationResult = Apollo.MutationResult<CreateSchemaMutation>;
export type CreateSchemaMutationOptions = Apollo.BaseMutationOptions<CreateSchemaMutation, CreateSchemaMutationVariables>;
export const TableForBranchDocument = gql`
    query TableForBranch($name: String!, $databaseName: String!, $refName: String!, $tableName: String!, $schemaName: String) {
  table(
    name: $name
    databaseName: $databaseName
    refName: $refName
    tableName: $tableName
    schemaName: $schemaName
  ) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      tableName: // value for 'tableName'
 *      schemaName: // value for 'schemaName'
 *   },
 * });
 */
export function useTableForBranchQuery(baseOptions: Apollo.QueryHookOptions<TableForBranchQuery, TableForBranchQueryVariables> & ({ variables: TableForBranchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableForBranchQuery, TableForBranchQueryVariables>(TableForBranchDocument, options);
      }
export function useTableForBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableForBranchQuery, TableForBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableForBranchQuery, TableForBranchQueryVariables>(TableForBranchDocument, options);
        }
export function useTableForBranchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TableForBranchQuery, TableForBranchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TableForBranchQuery, TableForBranchQueryVariables>(TableForBranchDocument, options);
        }
export type TableForBranchQueryHookResult = ReturnType<typeof useTableForBranchQuery>;
export type TableForBranchLazyQueryHookResult = ReturnType<typeof useTableForBranchLazyQuery>;
export type TableForBranchSuspenseQueryHookResult = ReturnType<typeof useTableForBranchSuspenseQuery>;
export type TableForBranchQueryResult = Apollo.QueryResult<TableForBranchQuery, TableForBranchQueryVariables>;
export const AddDatabaseConnectionDocument = gql`
    mutation AddDatabaseConnection($connectionUrl: String!, $name: String!, $hideDoltFeatures: Boolean, $useSSL: Boolean, $type: DatabaseType) {
  addDatabaseConnection(
    connectionUrl: $connectionUrl
    name: $name
    hideDoltFeatures: $hideDoltFeatures
    useSSL: $useSSL
    type: $type
  ) {
    currentDatabase
  }
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
 *      connectionUrl: // value for 'connectionUrl'
 *      name: // value for 'name'
 *      hideDoltFeatures: // value for 'hideDoltFeatures'
 *      useSSL: // value for 'useSSL'
 *      type: // value for 'type'
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
export const StoredConnectionsDocument = gql`
    query StoredConnections {
  storedConnections {
    ...DatabaseConnection
  }
}
    ${DatabaseConnectionFragmentDoc}`;

/**
 * __useStoredConnectionsQuery__
 *
 * To run a query within a React component, call `useStoredConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStoredConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStoredConnectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useStoredConnectionsQuery(baseOptions?: Apollo.QueryHookOptions<StoredConnectionsQuery, StoredConnectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StoredConnectionsQuery, StoredConnectionsQueryVariables>(StoredConnectionsDocument, options);
      }
export function useStoredConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StoredConnectionsQuery, StoredConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StoredConnectionsQuery, StoredConnectionsQueryVariables>(StoredConnectionsDocument, options);
        }
export function useStoredConnectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<StoredConnectionsQuery, StoredConnectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<StoredConnectionsQuery, StoredConnectionsQueryVariables>(StoredConnectionsDocument, options);
        }
export type StoredConnectionsQueryHookResult = ReturnType<typeof useStoredConnectionsQuery>;
export type StoredConnectionsLazyQueryHookResult = ReturnType<typeof useStoredConnectionsLazyQuery>;
export type StoredConnectionsSuspenseQueryHookResult = ReturnType<typeof useStoredConnectionsSuspenseQuery>;
export type StoredConnectionsQueryResult = Apollo.QueryResult<StoredConnectionsQuery, StoredConnectionsQueryVariables>;
export const RemoveConnectionDocument = gql`
    mutation RemoveConnection($name: String!) {
  removeDatabaseConnection(name: $name)
}
    `;
export type RemoveConnectionMutationFn = Apollo.MutationFunction<RemoveConnectionMutation, RemoveConnectionMutationVariables>;

/**
 * __useRemoveConnectionMutation__
 *
 * To run a mutation, you first call `useRemoveConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeConnectionMutation, { data, loading, error }] = useRemoveConnectionMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useRemoveConnectionMutation(baseOptions?: Apollo.MutationHookOptions<RemoveConnectionMutation, RemoveConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveConnectionMutation, RemoveConnectionMutationVariables>(RemoveConnectionDocument, options);
      }
export type RemoveConnectionMutationHookResult = ReturnType<typeof useRemoveConnectionMutation>;
export type RemoveConnectionMutationResult = Apollo.MutationResult<RemoveConnectionMutation>;
export type RemoveConnectionMutationOptions = Apollo.BaseMutationOptions<RemoveConnectionMutation, RemoveConnectionMutationVariables>;
export const BranchListDocument = gql`
    query BranchList($name: String!, $databaseName: String!, $sortBy: SortBranchesBy, $offset: Int) {
  branches(
    name: $name
    databaseName: $databaseName
    sortBy: $sortBy
    offset: $offset
  ) {
    list {
      ...Branch
    }
    nextOffset
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      sortBy: // value for 'sortBy'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useBranchListQuery(baseOptions: Apollo.QueryHookOptions<BranchListQuery, BranchListQueryVariables> & ({ variables: BranchListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchListQuery, BranchListQueryVariables>(BranchListDocument, options);
      }
export function useBranchListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchListQuery, BranchListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchListQuery, BranchListQueryVariables>(BranchListDocument, options);
        }
export function useBranchListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BranchListQuery, BranchListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BranchListQuery, BranchListQueryVariables>(BranchListDocument, options);
        }
export type BranchListQueryHookResult = ReturnType<typeof useBranchListQuery>;
export type BranchListLazyQueryHookResult = ReturnType<typeof useBranchListLazyQuery>;
export type BranchListSuspenseQueryHookResult = ReturnType<typeof useBranchListSuspenseQuery>;
export type BranchListQueryResult = Apollo.QueryResult<BranchListQuery, BranchListQueryVariables>;
export const RemoteBranchesDocument = gql`
    query RemoteBranches($name: String!, $databaseName: String!, $sortBy: SortBranchesBy, $offset: Int) {
  remoteBranches(
    name: $name
    databaseName: $databaseName
    sortBy: $sortBy
    offset: $offset
  ) {
    list {
      ...Branch
    }
    nextOffset
  }
}
    ${BranchFragmentDoc}`;

/**
 * __useRemoteBranchesQuery__
 *
 * To run a query within a React component, call `useRemoteBranchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRemoteBranchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRemoteBranchesQuery({
 *   variables: {
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      sortBy: // value for 'sortBy'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useRemoteBranchesQuery(baseOptions: Apollo.QueryHookOptions<RemoteBranchesQuery, RemoteBranchesQueryVariables> & ({ variables: RemoteBranchesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RemoteBranchesQuery, RemoteBranchesQueryVariables>(RemoteBranchesDocument, options);
      }
export function useRemoteBranchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RemoteBranchesQuery, RemoteBranchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RemoteBranchesQuery, RemoteBranchesQueryVariables>(RemoteBranchesDocument, options);
        }
export function useRemoteBranchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RemoteBranchesQuery, RemoteBranchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RemoteBranchesQuery, RemoteBranchesQueryVariables>(RemoteBranchesDocument, options);
        }
export type RemoteBranchesQueryHookResult = ReturnType<typeof useRemoteBranchesQuery>;
export type RemoteBranchesLazyQueryHookResult = ReturnType<typeof useRemoteBranchesLazyQuery>;
export type RemoteBranchesSuspenseQueryHookResult = ReturnType<typeof useRemoteBranchesSuspenseQuery>;
export type RemoteBranchesQueryResult = Apollo.QueryResult<RemoteBranchesQuery, RemoteBranchesQueryVariables>;
export const DeleteBranchDocument = gql`
    mutation DeleteBranch($name: String!, $branchName: String!, $databaseName: String!) {
  deleteBranch(name: $name, branchName: $branchName, databaseName: $databaseName)
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
 *      name: // value for 'name'
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
    mutation CreateBranch($name: String!, $newBranchName: String!, $databaseName: String!, $fromRefName: String!) {
  createBranch(
    name: $name
    newBranchName: $newBranchName
    databaseName: $databaseName
    fromRefName: $fromRefName
  )
}
    `;
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
 *      name: // value for 'name'
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
export const DocsRowsForDocPageQueryDocument = gql`
    query DocsRowsForDocPageQuery($name: String!, $databaseName: String!, $refName: String!) {
  docs(name: $name, databaseName: $databaseName, refName: $refName) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *   },
 * });
 */
export function useDocsRowsForDocPageQuery(baseOptions: Apollo.QueryHookOptions<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables> & ({ variables: DocsRowsForDocPageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>(DocsRowsForDocPageQueryDocument, options);
      }
export function useDocsRowsForDocPageQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>(DocsRowsForDocPageQueryDocument, options);
        }
export function useDocsRowsForDocPageQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>(DocsRowsForDocPageQueryDocument, options);
        }
export type DocsRowsForDocPageQueryHookResult = ReturnType<typeof useDocsRowsForDocPageQuery>;
export type DocsRowsForDocPageQueryLazyQueryHookResult = ReturnType<typeof useDocsRowsForDocPageQueryLazyQuery>;
export type DocsRowsForDocPageQuerySuspenseQueryHookResult = ReturnType<typeof useDocsRowsForDocPageQuerySuspenseQuery>;
export type DocsRowsForDocPageQueryQueryResult = Apollo.QueryResult<DocsRowsForDocPageQuery, DocsRowsForDocPageQueryVariables>;
export const DocDataForDocPageDocument = gql`
    query DocDataForDocPage($name: String!, $databaseName: String!, $refName: String!, $docType: DocType) {
  docOrDefaultDoc(
    name: $name
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      docType: // value for 'docType'
 *   },
 * });
 */
export function useDocDataForDocPageQuery(baseOptions: Apollo.QueryHookOptions<DocDataForDocPageQuery, DocDataForDocPageQueryVariables> & ({ variables: DocDataForDocPageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>(DocDataForDocPageDocument, options);
      }
export function useDocDataForDocPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>(DocDataForDocPageDocument, options);
        }
export function useDocDataForDocPageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>(DocDataForDocPageDocument, options);
        }
export type DocDataForDocPageQueryHookResult = ReturnType<typeof useDocDataForDocPageQuery>;
export type DocDataForDocPageLazyQueryHookResult = ReturnType<typeof useDocDataForDocPageLazyQuery>;
export type DocDataForDocPageSuspenseQueryHookResult = ReturnType<typeof useDocDataForDocPageSuspenseQuery>;
export type DocDataForDocPageQueryResult = Apollo.QueryResult<DocDataForDocPageQuery, DocDataForDocPageQueryVariables>;
export const DocPageQueryNoBranchDocument = gql`
    query DocPageQueryNoBranch($name: String!, $databaseName: String!) {
  branchOrDefault(name: $name, databaseName: $databaseName) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useDocPageQueryNoBranch(baseOptions: Apollo.QueryHookOptions<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables> & ({ variables: DocPageQueryNoBranchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>(DocPageQueryNoBranchDocument, options);
      }
export function useDocPageQueryNoBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>(DocPageQueryNoBranchDocument, options);
        }
export function useDocPageQueryNoBranchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>(DocPageQueryNoBranchDocument, options);
        }
export type DocPageQueryNoBranchHookResult = ReturnType<typeof useDocPageQueryNoBranch>;
export type DocPageQueryNoBranchLazyQueryHookResult = ReturnType<typeof useDocPageQueryNoBranchLazyQuery>;
export type DocPageQueryNoBranchSuspenseQueryHookResult = ReturnType<typeof useDocPageQueryNoBranchSuspenseQuery>;
export type DocPageQueryNoBranchQueryResult = Apollo.QueryResult<DocPageQueryNoBranchQuery, DocPageQueryNoBranchQueryVariables>;
export const GetBranchForPullDocument = gql`
    query GetBranchForPull($name: String!, $branchName: String!, $databaseName: String!) {
  branch(name: $name, branchName: $branchName, databaseName: $databaseName) {
    _id
  }
}
    `;

/**
 * __useGetBranchForPullQuery__
 *
 * To run a query within a React component, call `useGetBranchForPullQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBranchForPullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBranchForPullQuery({
 *   variables: {
 *      name: // value for 'name'
 *      branchName: // value for 'branchName'
 *      databaseName: // value for 'databaseName'
 *   },
 * });
 */
export function useGetBranchForPullQuery(baseOptions: Apollo.QueryHookOptions<GetBranchForPullQuery, GetBranchForPullQueryVariables> & ({ variables: GetBranchForPullQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBranchForPullQuery, GetBranchForPullQueryVariables>(GetBranchForPullDocument, options);
      }
export function useGetBranchForPullLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBranchForPullQuery, GetBranchForPullQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBranchForPullQuery, GetBranchForPullQueryVariables>(GetBranchForPullDocument, options);
        }
export function useGetBranchForPullSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBranchForPullQuery, GetBranchForPullQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBranchForPullQuery, GetBranchForPullQueryVariables>(GetBranchForPullDocument, options);
        }
export type GetBranchForPullQueryHookResult = ReturnType<typeof useGetBranchForPullQuery>;
export type GetBranchForPullLazyQueryHookResult = ReturnType<typeof useGetBranchForPullLazyQuery>;
export type GetBranchForPullSuspenseQueryHookResult = ReturnType<typeof useGetBranchForPullSuspenseQuery>;
export type GetBranchForPullQueryResult = Apollo.QueryResult<GetBranchForPullQuery, GetBranchForPullQueryVariables>;
export const MergePullDocument = gql`
    mutation MergePull($name: String!, $databaseName: String!, $fromBranchName: String!, $toBranchName: String!, $author: AuthorInfo) {
  mergePull(
    name: $name
    databaseName: $databaseName
    fromBranchName: $fromBranchName
    toBranchName: $toBranchName
    author: $author
  )
}
    `;
export type MergePullMutationFn = Apollo.MutationFunction<MergePullMutation, MergePullMutationVariables>;

/**
 * __useMergePullMutation__
 *
 * To run a mutation, you first call `useMergePullMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMergePullMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [mergePullMutation, { data, loading, error }] = useMergePullMutation({
 *   variables: {
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      fromBranchName: // value for 'fromBranchName'
 *      toBranchName: // value for 'toBranchName'
 *      author: // value for 'author'
 *   },
 * });
 */
export function useMergePullMutation(baseOptions?: Apollo.MutationHookOptions<MergePullMutation, MergePullMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MergePullMutation, MergePullMutationVariables>(MergePullDocument, options);
      }
export type MergePullMutationHookResult = ReturnType<typeof useMergePullMutation>;
export type MergePullMutationResult = Apollo.MutationResult<MergePullMutation>;
export type MergePullMutationOptions = Apollo.BaseMutationOptions<MergePullMutation, MergePullMutationVariables>;
export const CreateTagDocument = gql`
    mutation CreateTag($name: String!, $databaseName: String!, $tagName: String!, $message: String, $fromRefName: String!, $author: AuthorInfo) {
  createTag(
    name: $name
    databaseName: $databaseName
    tagName: $tagName
    message: $message
    fromRefName: $fromRefName
    author: $author
  )
}
    `;
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      tagName: // value for 'tagName'
 *      message: // value for 'message'
 *      fromRefName: // value for 'fromRefName'
 *      author: // value for 'author'
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
export const LoadDataDocument = gql`
    mutation LoadData($name: String!, $databaseName: String!, $refName: String!, $schemaName: String, $tableName: String!, $importOp: ImportOperation!, $fileType: FileType!, $file: Upload!, $modifier: LoadDataModifier) {
  loadDataFile(
    name: $name
    databaseName: $databaseName
    refName: $refName
    schemaName: $schemaName
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      schemaName: // value for 'schemaName'
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
    query DoltDatabaseDetails($name: String!) {
  doltDatabaseDetails(name: $name) {
    isDolt
    hideDoltFeatures
    type
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
 *      name: // value for 'name'
 *   },
 * });
 */
export function useDoltDatabaseDetailsQuery(baseOptions: Apollo.QueryHookOptions<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables> & ({ variables: DoltDatabaseDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>(DoltDatabaseDetailsDocument, options);
      }
export function useDoltDatabaseDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>(DoltDatabaseDetailsDocument, options);
        }
export function useDoltDatabaseDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>(DoltDatabaseDetailsDocument, options);
        }
export type DoltDatabaseDetailsQueryHookResult = ReturnType<typeof useDoltDatabaseDetailsQuery>;
export type DoltDatabaseDetailsLazyQueryHookResult = ReturnType<typeof useDoltDatabaseDetailsLazyQuery>;
export type DoltDatabaseDetailsSuspenseQueryHookResult = ReturnType<typeof useDoltDatabaseDetailsSuspenseQuery>;
export type DoltDatabaseDetailsQueryResult = Apollo.QueryResult<DoltDatabaseDetailsQuery, DoltDatabaseDetailsQueryVariables>;
export const DataTableQueryDocument = gql`
    query DataTableQuery($name: String!, $databaseName: String!, $refName: String!, $tableName: String!, $schemaName: String) {
  table(
    name: $name
    databaseName: $databaseName
    refName: $refName
    tableName: $tableName
    schemaName: $schemaName
  ) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      tableName: // value for 'tableName'
 *      schemaName: // value for 'schemaName'
 *   },
 * });
 */
export function useDataTableQuery(baseOptions: Apollo.QueryHookOptions<DataTableQuery, DataTableQueryVariables> & ({ variables: DataTableQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DataTableQuery, DataTableQueryVariables>(DataTableQueryDocument, options);
      }
export function useDataTableQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DataTableQuery, DataTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DataTableQuery, DataTableQueryVariables>(DataTableQueryDocument, options);
        }
export function useDataTableQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DataTableQuery, DataTableQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DataTableQuery, DataTableQueryVariables>(DataTableQueryDocument, options);
        }
export type DataTableQueryHookResult = ReturnType<typeof useDataTableQuery>;
export type DataTableQueryLazyQueryHookResult = ReturnType<typeof useDataTableQueryLazyQuery>;
export type DataTableQuerySuspenseQueryHookResult = ReturnType<typeof useDataTableQuerySuspenseQuery>;
export type DataTableQueryQueryResult = Apollo.QueryResult<DataTableQuery, DataTableQueryVariables>;
export const RowsForDataTableQueryDocument = gql`
    query RowsForDataTableQuery($name: String!, $databaseName: String!, $refName: String!, $tableName: String!, $schemaName: String, $offset: Int) {
  rows(
    name: $name
    databaseName: $databaseName
    refName: $refName
    tableName: $tableName
    schemaName: $schemaName
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      tableName: // value for 'tableName'
 *      schemaName: // value for 'schemaName'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useRowsForDataTableQuery(baseOptions: Apollo.QueryHookOptions<RowsForDataTableQuery, RowsForDataTableQueryVariables> & ({ variables: RowsForDataTableQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RowsForDataTableQuery, RowsForDataTableQueryVariables>(RowsForDataTableQueryDocument, options);
      }
export function useRowsForDataTableQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RowsForDataTableQuery, RowsForDataTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RowsForDataTableQuery, RowsForDataTableQueryVariables>(RowsForDataTableQueryDocument, options);
        }
export function useRowsForDataTableQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RowsForDataTableQuery, RowsForDataTableQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RowsForDataTableQuery, RowsForDataTableQueryVariables>(RowsForDataTableQueryDocument, options);
        }
export type RowsForDataTableQueryHookResult = ReturnType<typeof useRowsForDataTableQuery>;
export type RowsForDataTableQueryLazyQueryHookResult = ReturnType<typeof useRowsForDataTableQueryLazyQuery>;
export type RowsForDataTableQuerySuspenseQueryHookResult = ReturnType<typeof useRowsForDataTableQuerySuspenseQuery>;
export type RowsForDataTableQueryQueryResult = Apollo.QueryResult<RowsForDataTableQuery, RowsForDataTableQueryVariables>;
export const DiffSummariesDocument = gql`
    query DiffSummaries($name: String!, $databaseName: String!, $fromRefName: String!, $toRefName: String!, $refName: String, $type: CommitDiffType) {
  diffSummaries(
    name: $name
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      fromRefName: // value for 'fromRefName'
 *      toRefName: // value for 'toRefName'
 *      refName: // value for 'refName'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useDiffSummariesQuery(baseOptions: Apollo.QueryHookOptions<DiffSummariesQuery, DiffSummariesQueryVariables> & ({ variables: DiffSummariesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiffSummariesQuery, DiffSummariesQueryVariables>(DiffSummariesDocument, options);
      }
export function useDiffSummariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiffSummariesQuery, DiffSummariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiffSummariesQuery, DiffSummariesQueryVariables>(DiffSummariesDocument, options);
        }
export function useDiffSummariesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DiffSummariesQuery, DiffSummariesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DiffSummariesQuery, DiffSummariesQueryVariables>(DiffSummariesDocument, options);
        }
export type DiffSummariesQueryHookResult = ReturnType<typeof useDiffSummariesQuery>;
export type DiffSummariesLazyQueryHookResult = ReturnType<typeof useDiffSummariesLazyQuery>;
export type DiffSummariesSuspenseQueryHookResult = ReturnType<typeof useDiffSummariesSuspenseQuery>;
export type DiffSummariesQueryResult = Apollo.QueryResult<DiffSummariesQuery, DiffSummariesQueryVariables>;
export const HistoryForBranchDocument = gql`
    query HistoryForBranch($name: String!, $databaseName: String!, $refName: String!, $offset: Int) {
  commits(
    name: $name
    databaseName: $databaseName
    refName: $refName
    offset: $offset
  ) {
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useHistoryForBranchQuery(baseOptions: Apollo.QueryHookOptions<HistoryForBranchQuery, HistoryForBranchQueryVariables> & ({ variables: HistoryForBranchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HistoryForBranchQuery, HistoryForBranchQueryVariables>(HistoryForBranchDocument, options);
      }
export function useHistoryForBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HistoryForBranchQuery, HistoryForBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HistoryForBranchQuery, HistoryForBranchQueryVariables>(HistoryForBranchDocument, options);
        }
export function useHistoryForBranchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HistoryForBranchQuery, HistoryForBranchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HistoryForBranchQuery, HistoryForBranchQueryVariables>(HistoryForBranchDocument, options);
        }
export type HistoryForBranchQueryHookResult = ReturnType<typeof useHistoryForBranchQuery>;
export type HistoryForBranchLazyQueryHookResult = ReturnType<typeof useHistoryForBranchLazyQuery>;
export type HistoryForBranchSuspenseQueryHookResult = ReturnType<typeof useHistoryForBranchSuspenseQuery>;
export type HistoryForBranchQueryResult = Apollo.QueryResult<HistoryForBranchQuery, HistoryForBranchQueryVariables>;
export const BranchListForCommitGraphDocument = gql`
    query BranchListForCommitGraph($name: String!, $databaseName: String!, $offset: Int) {
  branches(name: $name, databaseName: $databaseName, offset: $offset) {
    list {
      ...BranchForCommitGraph
    }
    nextOffset
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useBranchListForCommitGraphQuery(baseOptions: Apollo.QueryHookOptions<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables> & ({ variables: BranchListForCommitGraphQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>(BranchListForCommitGraphDocument, options);
      }
export function useBranchListForCommitGraphLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>(BranchListForCommitGraphDocument, options);
        }
export function useBranchListForCommitGraphSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>(BranchListForCommitGraphDocument, options);
        }
export type BranchListForCommitGraphQueryHookResult = ReturnType<typeof useBranchListForCommitGraphQuery>;
export type BranchListForCommitGraphLazyQueryHookResult = ReturnType<typeof useBranchListForCommitGraphLazyQuery>;
export type BranchListForCommitGraphSuspenseQueryHookResult = ReturnType<typeof useBranchListForCommitGraphSuspenseQuery>;
export type BranchListForCommitGraphQueryResult = Apollo.QueryResult<BranchListForCommitGraphQuery, BranchListForCommitGraphQueryVariables>;
export const TableNamesDocument = gql`
    query TableNames($name: String!, $databaseName: String!, $refName: String!, $schemaName: String, $filterSystemTables: Boolean) {
  tableNames(
    name: $name
    databaseName: $databaseName
    refName: $refName
    schemaName: $schemaName
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
 *      name: // value for 'name'
 *      databaseName: // value for 'databaseName'
 *      refName: // value for 'refName'
 *      schemaName: // value for 'schemaName'
 *      filterSystemTables: // value for 'filterSystemTables'
 *   },
 * });
 */
export function useTableNamesQuery(baseOptions: Apollo.QueryHookOptions<TableNamesQuery, TableNamesQueryVariables> & ({ variables: TableNamesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TableNamesQuery, TableNamesQueryVariables>(TableNamesDocument, options);
      }
export function useTableNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TableNamesQuery, TableNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TableNamesQuery, TableNamesQueryVariables>(TableNamesDocument, options);
        }
export function useTableNamesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TableNamesQuery, TableNamesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TableNamesQuery, TableNamesQueryVariables>(TableNamesDocument, options);
        }
export type TableNamesQueryHookResult = ReturnType<typeof useTableNamesQuery>;
export type TableNamesLazyQueryHookResult = ReturnType<typeof useTableNamesLazyQuery>;
export type TableNamesSuspenseQueryHookResult = ReturnType<typeof useTableNamesSuspenseQuery>;
export type TableNamesQueryResult = Apollo.QueryResult<TableNamesQuery, TableNamesQueryVariables>;