import { Field, Int, ObjectType } from "@nestjs/graphql";
import { RawRows } from "../dataSources/types";

@ObjectType()
export class TextDiff {
  @Field()
  leftLines: string;

  @Field()
  rightLines: string;
}

@ObjectType()
export class SchemaDiff {
  @Field(_type => TextDiff, { nullable: true })
  schemaDiff?: TextDiff;

  @Field(_type => [String], { nullable: true })
  schemaPatch?: string[];

  @Field(_type => Int, { nullable: true })
  numChangedSchemas?: number;
}

function fromSchemaPatchRows(res: RawRows): string[] {
  return res.map(r => r.statement);
}

function fromSchemaDiffRows(res: RawRows): TextDiff | undefined {
  if (!res.length) return undefined;
  return {
    leftLines: res[0].from_create_statement,
    rightLines: res[0].to_create_statement,
  };
}

export function fromDoltSchemaDiffRows(
  patch: RawRows,
  diff: RawRows,
): SchemaDiff {
  return {
    schemaDiff: fromSchemaDiffRows(diff),
    schemaPatch: fromSchemaPatchRows(patch),
  };
}
