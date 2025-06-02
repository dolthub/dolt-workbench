import { Field, Float, ObjectType } from "@nestjs/graphql";
import { RawRow, RawRows } from "../queryFactory/types";

@ObjectType()
export class DiffStat {
  @Field(() => Float)
  rowsUnmodified: number;

  @Field(() => Float)
  rowsAdded: number;

  @Field(() => Float)
  rowsDeleted: number;

  @Field(() => Float)
  rowsModified: number;

  @Field(() => Float)
  cellsModified: number;

  @Field(() => Float)
  rowCount: number;

  @Field(() => Float)
  cellCount: number;
}

const defaultStat = {
  rowsUnmodified: 0,
  rowsAdded: 0,
  rowsDeleted: 0,
  rowsModified: 0,
  cellsModified: 0,
  rowCount: 0,
  cellCount: 0,
};

export function fromDoltDiffStat(res: RawRows): DiffStat {
  if (!res.length) return defaultStat;

  const reduced = res.reduce((acc: DiffStat, row: RawRow) => {
    return {
      rowsUnmodified: Number(row.rows_unmodified) + acc.rowsUnmodified,
      rowsAdded: Number(row.rows_added) + acc.rowsAdded,
      rowsDeleted: Number(row.rows_deleted) + acc.rowsDeleted,
      rowsModified: Number(row.rows_modified) + acc.rowsModified,
      cellsModified: Number(row.cells_modified) + acc.cellsModified,
      rowCount: Number(row.new_row_count) + acc.rowCount,
      cellCount: Number(row.new_cell_count) + acc.cellCount,
    };
  }, defaultStat);

  return reduced;
}
