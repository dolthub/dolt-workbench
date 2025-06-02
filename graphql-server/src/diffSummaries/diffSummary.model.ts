import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import { TableDiffType, toTableDiffType } from "./diffSummary.enums";

@ObjectType()
export class DiffSummary {
  @Field(() => ID)
  _id: string;

  @Field()
  fromTableName: string;

  @Field()
  toTableName: string;

  @Field()
  tableName: string;

  @Field(() => TableDiffType)
  tableType: TableDiffType;

  @Field()
  hasDataChanges: boolean;

  @Field()
  hasSchemaChanges: boolean;
}

export function fromDoltDiffSummary(row: RawRow): DiffSummary {
  const fromTableName = row.from_table_name;
  const toTableName = row.to_table_name;
  const tableName = getTableName(fromTableName, toTableName);
  const _id = `tableDiffSummaries/${tableName}`;
  return {
    _id,
    fromTableName,
    toTableName,
    tableName,
    tableType: toTableDiffType(row.diff_type),
    hasDataChanges: row.data_change,
    hasSchemaChanges: row.schema_change,
  };
}

function getTableName(fromTableName: string, toTableName: string): string {
  if (!fromTableName.length && !toTableName.length) return "";
  if (!fromTableName.length) return toTableName;
  if (!toTableName.length) return fromTableName;
  if (fromTableName !== toTableName) {
    return toTableName;
  }
  return toTableName;
}
