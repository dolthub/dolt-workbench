import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../dataSources/types";

@ObjectType()
export class ColConstraint {
  @Field()
  notNull: boolean;
}

@ObjectType()
export class Column {
  @Field()
  name: string;

  @Field()
  isPrimaryKey: boolean;

  @Field()
  type: string;

  @Field({ nullable: true })
  sourceTable?: string;

  @Field(_type => [ColConstraint], { nullable: true })
  constraints?: ColConstraint[];
}

export function fromDoltRowRes(col: RawRow, tableName: string): Column {
  return {
    name: col.Field,
    isPrimaryKey: col.Key === "PRI",
    type: col.Type,
    constraints: [{ notNull: col.Null === "NO" }],
    sourceTable: tableName,
  };
}
