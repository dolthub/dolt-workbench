import { sprintf } from "@dolthub/web-utils";
import { ColumnForDataTableFragment, CommitDiffType } from "@gen/graphql-types";
import { fakeCommitId } from "@hooks/useCommitListForBranch/mocks";
import { RequiredRefsParams, TableParams } from "@lib/params";
import { Props } from "../useGetDoltCommitDiffQuery";
import { maybeConvertToPG } from "./utils";

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

export const getNoDiffTagsOrRemovedColsExpected = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = '$' AND `to_commit` = '$'",
      isPG,
    ),
    params.tableName,
    params.fromRefName,
    params.toRefName,
  );

export const noDiffTagsAndRemovedColsProps: Props = {
  params,
  columns: tableCols,
  hiddenColIndexes: [1],
};

export const getNoDiffTagsAndRemovedColsExpected = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = '$' AND `to_commit` = '$'",
      isPG,
    ),
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

export const getNoDiffTagsAndRemovedColsForPullExpected = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_$` WHERE `from_commit` = DOLT_MERGE_BASE('$', '$') AND `to_commit` = HASHOF('$')",
      isPG,
    ),
    params.tableName,
    params.toRefName,
    params.fromRefName,
    params.fromRefName,
  );
