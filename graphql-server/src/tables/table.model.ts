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
  // const tableName = typeTable.name;
  return {
    ...details,
    _id: `databases/${databaseName}/refs/${refName}/tables/${details.tableName}`,
    databaseName,
    refName,
    // tableName,
    // columns: typeTable.columns.map(c => {
    //   return {
    //     name: c.name,
    //     isPrimaryKey: c.isPrimary,
    //     type: `${c.type}${c.length ? `(${c.length})` : ""}${
    //       c.unsigned ? " unsigned" : ""
    //     }`,
    //     constraints: [{ notNull: !c.isNullable }],
    //     sourceTable: tableName,
    //   };
    // }),
    // foreignKeys: [],
    // indexes: [],
    // columns: columns.map(c => column.fromDoltRowRes(c, tableName)),
    // foreignKeys: foreignKey.fromDoltRowsRes(fkRows),
    // indexes: index.fromDoltRowsRes(idxRows),
  };
}
