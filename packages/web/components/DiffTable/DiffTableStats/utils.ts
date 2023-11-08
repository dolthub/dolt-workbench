import { getAllSelectColumns } from "@components/CellButtons/queryHelpers";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { RefsParams, RequiredRefsParams } from "@lib/params";
import { isHiddenColumn } from "../DataDiff/utils";

type Props = {
  params: RequiredRefsParams & {
    refName: string;
    tableName: string;
  };
  forPull?: boolean;
  columns: ColumnForDataTableFragment[];
  hiddenColIndexes: number[];
};

// Returns a dolt_commit_diff_$TABLENAME query that looks like:
// SELECT diff_type, `from_[col]`, `to_[col]`, [...], from_commit, from_commit_date, to_commit, to_commit_date
// FROM dolt_commit_diff_[tableName]
// WHERE from_commit="[fromCommitId]" AND to_commit="[toCommitId]"
export function getDoltCommitDiffQuery(props: Props): string {
  const colsWithNamesAndVals = transformColsFromDiffCols(
    props.columns,
    props.hiddenColIndexes,
  );
  const cols = getAllSelectColumns(colsWithNamesAndVals);
  return `SELECT ${cols} FROM \`dolt_commit_diff_${
    props.params.tableName
  }\`${getWhereClause(props.params, props.forPull)}`;
}

function getWhereClause(params: RefsParams, forPull = false): string {
  const toCommit = forPull
    ? `DOLT_MERGE_BASE("${params.toRefName}", "${params.fromRefName}")`
    : `"${params.toRefName}"`;
  return ` WHERE from_commit="${params.fromRefName}" AND to_commit=${toCommit}`;
}

// Get names and values for every column based on row value and dolt_commit_diff table
// column names, excluding hidden columns
export function transformColsFromDiffCols(
  cols: ColumnForDataTableFragment[],
  hiddenColIndexes: number[],
): Array<{ names: string[] }> {
  return cols
    .filter((_, i) => !isHiddenColumn(i, hiddenColIndexes))
    .map(col => {
      return { names: [col.name] };
    });
}
