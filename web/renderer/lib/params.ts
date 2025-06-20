import { Maybe } from "@dolthub/web-utils";

export type DatabaseParams = {
  databaseName: string;
};

export type DatabaseOptionalSchemaParams = DatabaseParams & {
  schemaName?: string;
};

export type RefParams = DatabaseParams & {
  refName: string;
};

export type BranchParams = DatabaseParams & {
  branchName: string;
};

export type OptionalRefParams = DatabaseParams & {
  refName?: string;
};

export type RefOptionalSchemaParams = RefParams & {
  schemaName?: string;
};

export type OptionalRefAndSchemaParams = OptionalRefParams & {
  schemaName?: string;
};

export type MaybeRefParams = DatabaseParams & {
  refName?: Maybe<string>;
};

export type DatabasePageParams = OptionalRefAndSchemaParams & {
  tableName?: string;
  q?: string;
};

export type SqlQueryParams = RefOptionalSchemaParams & {
  q: string;
  active?: string;
};

export type TableParams = RefParams & {
  tableName: string;
};

export type TableOptionalSchemaParams = TableParams & {
  schemaName?: string;
};

export type DocParams = RefParams & {
  docName: string;
};

export type CommitParams = RefParams & {
  commitId: string;
};

export type CommitsParams = {
  fromCommitId?: string;
  toCommitId?: string;
};

export type RequiredCommitsParams = DatabaseParams & Required<CommitsParams>;

export type RefsParams = {
  fromRefName: string;
  toRefName: string;
};

export type RequiredRefsParams = DatabaseParams & RefsParams;

export type DiffParams = RefParams & CommitsParams;

export type UploadParams = DatabaseParams & {
  uploadId: string;
};

export type UploadParamsWithOptions = UploadParams & {
  branchName?: string;
  tableName?: string;
  schemaName?: string;
};

export type DiffRangeParams = RefParams & {
  diffRange: string;
};

export type DiffParamsWithRefs = DatabaseParams & {
  fromRefName: string;
  toRefName: string;
};

export type PullParams = OptionalRefParams & {
  fromBranchName?: string;
};

export type PullDiffParams = Required<PullParams>;

export type PullDiffParamsOptionalTableName = PullDiffParams & {
  tableName?: string | null;
};

export type PullDiffParamsWithTableName = PullDiffParams & {
  tableName: string;
};
