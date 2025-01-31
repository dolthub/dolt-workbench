import { isHiddenColumn } from "@components/DiffTable/DataDiff/utils";
import { ColumnForDataTableFragment, CommitDiffType } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import {
  getNewWhereFunctionCondition,
  getSqlFromTable,
  getWhereAndFromConditions,
  mapColsToColumnNames,
} from "@hooks/useSqlBuilder/util";
import { RefsParams, RequiredRefsParams } from "@lib/params";
import { Expr, Function as SqlFunction } from "node-sql-parser";
import { ReturnType } from "./types";
import { getAllSelectColumns } from "./utils";

export type Props = {
  params: RequiredRefsParams & {
    refName: string;
    tableName: string;
  };
  type?: CommitDiffType;
  columns: ColumnForDataTableFragment[];
  hiddenColIndexes: number[];
};

// Returns a dolt_commit_diff_$TABLENAME query that looks like:
// SELECT diff_type, `from_[col]`, `to_[col]`, [...], from_commit, from_commit_date, to_commit, to_commit_date
// FROM dolt_commit_diff_[tableName]
// WHERE from_commit="[fromCommitId]" AND to_commit="[toCommitId]"
export function useGetDoltCommitDiffQuery(props: Props): ReturnType {
  const { convertToSqlSelect, isPostgres } = useSqlBuilder(
    props.params.connectionName,
  );

  const generate = () => {
    const colsWithNamesAndVals = transformColsFromDiffCols(
      props.columns,
      props.hiddenColIndexes,
    );
    const cols = getAllSelectColumns(colsWithNamesAndVals);

    return convertToSqlSelect({
      from: getSqlFromTable(`dolt_commit_diff_${props.params.tableName}`),
      columns: mapColsToColumnNames(cols),
      where: getWhereClause(props.params, props.type),
    });
  };

  return { generateQuery: generate, isPostgres };
}

function getWhereClause(
  params: RefsParams,
  type?: CommitDiffType,
  isPostgres?: boolean,
): Expr | SqlFunction | null | undefined {
  if (type === CommitDiffType.ThreeDot) {
    return {
      type: "binary_expr",
      operator: "AND",
      left: getNewWhereFunctionCondition("from_commit", "DOLT_MERGE_BASE", [
        params.toRefName,
        params.fromRefName,
      ]),
      right: getNewWhereFunctionCondition("to_commit", "HASHOF", [
        params.fromRefName,
      ]),
    };
  }

  return getWhereAndFromConditions(
    [
      { col: "from_commit", val: params.fromRefName },
      { col: "to_commit", val: params.toRefName },
    ],
    !!isPostgres,
  );
}

// Get names and values for every column based on row value and dolt_commit_diff table
// column names, excluding hidden columns
function transformColsFromDiffCols(
  cols: ColumnForDataTableFragment[],
  hiddenColIndexes: number[],
): Array<{ names: string[] }> {
  return cols
    .filter((_, i) => !isHiddenColumn(i, hiddenColIndexes))
    .map(col => {
      return { names: [col.name] };
    });
}
