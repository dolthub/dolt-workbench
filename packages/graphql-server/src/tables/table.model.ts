import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import * as foreignKey from "../indexes/foreignKey.model";
import * as index from "../indexes/index.model";
import { RawRow } from "../utils/commonTypes";

@ObjectType()
export class Table {
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  tableName: string;

  @Field(_type => [column.Column])
  columns: column.Column[];

  @Field(_type => [foreignKey.ForeignKey])
  foreignKeys: foreignKey.ForeignKey[];

  @Field(_type => [index.Index])
  indexes: index.Index[];
}

@ObjectType()
export class TableNames {
  @Field(_type => [String])
  list: string[];
}

export function fromDoltRowRes(
  databaseName: string,
  tableName: string,
  columns: RawRow[],
  fkRows: RawRow[],
  idxRows: RawRow[],
): Table {
  return {
    _id: `databases/${databaseName}/tables/${tableName}`,
    databaseName,
    tableName,
    columns: columns.map(column.fromDoltRowRes),
    foreignKeys: foreignKey.fromDoltRowsRes(fkRows),
    indexes: index.fromDoltRowsRes(idxRows),
  };
}
