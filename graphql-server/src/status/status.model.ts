import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RawRows } from "../queryFactory/types";

@ObjectType()
export class Status {
  @Field(() => ID)
  _id: string;

  @Field()
  refName: string;

  @Field()
  tableName: string;

  @Field(() => Boolean)
  staged: boolean;

  @Field()
  status: string;
}

export function fromStatusRows(
  rows: RawRows,
  databaseName: string,
  refName: string,
): Status[] {
  return rows.map(r => {
    return {
      _id: `databases/${databaseName}/refs/${refName}/status/${r.table_name}`,
      refName,
      tableName: r.table_name,
      staged: !!r.staged,
      status: r.status,
    };
  });
}
