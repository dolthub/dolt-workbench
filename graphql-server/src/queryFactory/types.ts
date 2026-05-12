import { SortBranchesBy } from "../branches/branch.enum";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DiffRowType } from "../rowDiffs/rowDiff.enums";

export type DBArgs = { databaseName: string };
export type CloneArgs = DBArgs & { remoteDbPath: string };
export type SchemaArgs = DBArgs & { schemaName: string };
export type RefArgs = DBArgs & { refName: string };
export type RefSchemaArgs = RefArgs & { schemaName: string };
export type RefMaybeSchemaArgs = RefArgs & { schemaName?: string };
export type BranchArgs = DBArgs & { branchName: string };
export type RemoteArgs = DBArgs & { remoteName: string };
export type RemoteBranchesArgs = RemoteArgs & { offset: number };
export type AddRemoteArgs = RemoteArgs & { remoteUrl: string };
export type RemoteMaybeBranchArgs = RemoteArgs & {
  refName: string;
  branchName?: string;
};
export type RemoteBranchArgs = RemoteArgs & {
  branchName: string;
};
export type TagArgs = DBArgs & { tagName: string };
export type TableArgs = RefArgs & { tableName: string };
export type TableMaybeSchemaArgs = TableArgs & { schemaName?: string };

export type BranchesArgs = DBArgs & {
  fromBranchName: string;
  toBranchName: string;
  refName?: string;
};
export type ListBranchesArgs = DBArgs & {
  sortBy?: SortBranchesBy;
  offset: number;
};
export type RefsArgs = DBArgs & {
  fromRefName: string;
  toRefName: string;
  refName?: string;
};
export type RefsMaybeTableArgs = RefsArgs & { tableName?: string };
export type RefsTableArgs = RefsArgs & { tableName: string };
export type RefsTableWithSchemaArgs = RefsTableArgs & { schemaName: string };
export type RowDiffArgs = DBArgs & {
  refName?: string;
  schemaName?: string;
  tableName: string;
  fromTableName: string;
  toTableName: string;
  fromCommitId: string;
  toCommitId: string;
  offset: number;
  filterByRowType?: DiffRowType;
};

export type ListRemotesArgs = DBArgs & {
  offset: number;
};

export type RawRow = Record<string, any>;
export type RawRowWithDiff = {
  row: RawRow;
  diff?: RawRow;
};
export type RawRows = RawRow[];

export type SqlSelectResult = {
  rows: RawRows;
  isMutation: boolean;
  executionMessage: string;
  warnings?: string[];
  queryString?: string;
};
export type RawRowsWithDiff = RawRowWithDiff[];
export type PR = Promise<RawRows>;
export type SPR = Promise<RawRow>;
export type UPR = Promise<RawRows | undefined>;
export type USPR = Promise<RawRow | undefined>;
export type Params = Array<string | number | undefined> | undefined;
export type ParQuery = (q: string, p?: Params) => PR;

export type ColumnValue = {
  column: string;
  value?: string | null;
  type?: string;
};

export type DeleteRowArgs = TableMaybeSchemaArgs & {
  where: ColumnValue[];
};

export type InsertRowArgs = TableMaybeSchemaArgs & {
  values: ColumnValue[];
};

export type UpdateRowArgs = TableMaybeSchemaArgs & {
  set: ColumnValue[];
  where: ColumnValue[];
};

export type DropColumnArgs = TableMaybeSchemaArgs & {
  columnName: string;
};

export type CreateViewArgs = RefMaybeSchemaArgs & {
  name: string;
  queryString: string;
};

export type CallProcedureArgs = RefArgs & {
  name: string;
  args: string[];
};

export type DoltCommitDiffArgs = TableMaybeSchemaArgs & {
  fromCommitId: string;
  toCommitId: string;
  excludedColumns?: string[];
  type?: CommitDiffType;
};

export type DoltCellLookupArgs = TableMaybeSchemaArgs & {
  pkValues: ColumnValue[];
  columnName?: string;
};

export type OrderByClause = {
  column: string;
  direction: "ASC" | "DESC";
};

export type PkRow = {
  values: ColumnValue[];
};

export type SelectTableRowsArgs = TableMaybeSchemaArgs & {
  orderBy?: OrderByClause[];
  where?: ColumnValue[];
  excludePks?: PkRow[];
  projection?: string[];
  offset?: number;
};

export type MutationResult = {
  rowsAffected: number;
  queryString: string;
  executionMessage: string;
};

export type TableRowPagination = { pkCols: string[]; offset: number };
export type DiffRes = Promise<{ colsUnion: RawRows; diff: RawRows }>;
export type CommitsRes = Promise<{ fromCommitId: string; toCommitId: string }>;
export type CommitAuthor = { name: string; email: string };

export type TestArgs = {
  testName: string;
  testGroup: string;
  testQuery: string;
  assertionType: string;
  assertionComparator: string;
  assertionValue: string;
};

export type TestListArgs = {
  list: TestArgs[];
};
export type SaveTestsArgs = RefArgs & {
  tests: TestListArgs;
};

export type TestIdentifierArgs = {
  testName?: string;
  groupName?: string;
};

export type RunTestsArgs = RefArgs & {
  testIdentifier?: TestIdentifierArgs;
};
