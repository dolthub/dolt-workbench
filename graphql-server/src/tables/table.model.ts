import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import * as foreignKey from "../indexes/foreignKey.model";
import * as index from "../indexes/index.model";

@ObjectType()
export class TableDetails {
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
export class Table extends TableDetails {
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  refName: string;
}

@ObjectType()
export class TableNames {
  @Field(_type => [String])
  list: string[];
}

export function fromDoltRowRes(
  databaseName: string,
  refName: string,
  details: TableDetails,
): Table {
  return {
    ...details,
    _id: `databases/${databaseName}/refs/${refName}/tables/${details.tableName}`,
    databaseName,
    refName,
  };
}
