import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import * as row from "../rows/row.model";
import { ListOffsetRes } from "../utils/commonTypes";

@ObjectType()
export class RowConflict {
  @Field(_type => row.Row, { nullable: true })
  base?: row.Row;

  @Field(_type => row.Row, { nullable: true })
  ours?: row.Row;

  @Field(_type => row.Row, { nullable: true })
  theirs?: row.Row;
}

@ObjectType()
export class RowConflictList extends ListOffsetRes {
  @Field(_type => [RowConflict])
  list: RowConflict[];

  @Field(_type => [String])
  columns: string[];
}

@ObjectType()
export class PullConflictSummary {
  @Field(_type => ID)
  _id: string;

  @Field()
  tableName: string;

  @Field(_type => Int, { nullable: true })
  numDataConflicts?: number;

  @Field(_type => Int, { nullable: true })
  numSchemaConflicts?: number;
}

export function fromAPIModelPullConflictSummary(
  l: RawRow,
  databaseName: string,
  fromBranchName: string,
  toBranchName: string,
): PullConflictSummary {
  return {
    _id: `${databaseName}/pullConflictSummary/${fromBranchName}/${toBranchName}/${l.table}`,
    tableName: l.table,
    numDataConflicts: l.num_data_conflicts,
    numSchemaConflicts: l.num_schema_conflicts,
  };
}

export function fromAPIModelRowConflictList(list: RawRow[]): RowConflictList {
  const colsMap = new Map<string, boolean>();

  const rowConflictsList: RowConflict[] = list.map(l => {
    const base: row.ColumnValue[] = [];
    const ours: row.ColumnValue[] = [];
    const theirs: row.ColumnValue[] = [];

    Object.entries(l).forEach(([k, v]) => {
      if (k.endsWith("_diff_type")) {
        return; // Skip the diff_type columns
      }
      if (k.startsWith("base_")) {
        base.push({ displayValue: row.getCellValue(v, "") });
        colsMap.set(k.replace("base_", ""), true);
      } else if (k.startsWith("our_")) {
        ours.push({ displayValue: row.getCellValue(v, "") });
        colsMap.set(k.replace("our_", ""), true);
      } else if (k.startsWith("their_")) {
        theirs.push({ displayValue: row.getCellValue(v, "") });
        colsMap.set(k.replace("their_", ""), true);
      }
    });
    return {
      base: base.length > 0 ? { columnValues: base } : undefined,
      ours: ours.length > 0 ? { columnValues: ours } : undefined,
      theirs: theirs.length > 0 ? { columnValues: theirs } : undefined,
    };
  });

  return {
    list: rowConflictsList,
    nextOffset: undefined,
    columns: colsMap.size > 0 ? Array.from(colsMap.keys()) : [],
  };
}
