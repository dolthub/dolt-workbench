import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";

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
