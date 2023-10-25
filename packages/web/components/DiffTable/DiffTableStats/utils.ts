import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { CommitsParams, DiffParams } from "@lib/params";
import { getAllSelectColumns } from "@components/CellButtons/queryHelpers";
import { isHiddenColumn } from "../DataDiff/utils";

type Props = {
  params: Required<DiffParams> & {
    tableName: string;
  };
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
  }\`${getWhereClause(props.params)}`;
}

function getWhereClause(params: CommitsParams): string {
  return ` WHERE from_commit="${params.fromCommitId}" AND to_commit="${params.toCommitId}"`;
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
