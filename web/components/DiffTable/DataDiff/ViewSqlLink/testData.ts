import { ColumnForDataTableFragment, CommitDiffType } from "@gen/graphql-types";
import { fakeCommitId } from "@hooks/useCommitListForBranch/mocks";
import { RequiredRefsParams, TableParams } from "@lib/params";
import { sprintf } from "@lib/sprintf";
import { Props } from "./useGetDoltCommitDiffQuery";

type Params = RequiredRefsParams & { tableName: string; refName: string };

const tableParams: TableParams = {
  databaseName: "dbname",
  refName: "master",
  tableName: "test-table",
};

export const params: Params = {
  ...tableParams,
  fromRefName: fakeCommitId(),
  toRefName: fakeCommitId(),
};

export const tableCols: ColumnForDataTableFragment[] = [
  {
    __typename: "Column",
    name: "id",
    isPrimaryKey: true,
    type: "INT",
  },
  {
    __typename: "Column",
    name: "name",
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
];

export const noDiffTagsOrRemovedColsProps: Props = {
  params,
  columns: tableCols,
  hiddenColIndexes: [],
};

export const noDiffTagsOrRemovedColsExpected = sprintf(
  "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = '$' AND `to_commit` = '$'",
  params.tableName,
  params.fromRefName,
  params.toRefName,
);

export const noDiffTagsAndRemovedColsProps: Props = {
  params,
  columns: tableCols,
  hiddenColIndexes: [1],
};

export const noDiffTagsAndRemovedColsExpected = sprintf(
  "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = '$' AND `to_commit` = '$'",
  params.tableName,
  params.fromRefName,
  params.toRefName,
);

export const noDiffTagsAndRemovedColsForPullProps: Props = {
  params,
  columns: tableCols,
  hiddenColIndexes: [1],
  type: CommitDiffType.ThreeDot,
};

export const noDiffTagsAndRemovedColsForPullExpected = sprintf(
  "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = DOLT_MERGE_BASE('$', '$') AND `to_commit` = HASHOF('$')",
  params.tableName,
  params.toRefName,
  params.fromRefName,
  params.fromRefName,
);
