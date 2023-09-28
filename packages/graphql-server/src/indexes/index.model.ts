import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../utils/commonTypes";

@ObjectType()
export class IndexColumn {
  @Field()
  name: string;

  @Field({ nullable: true })
  sqlType?: string;
}

@ObjectType()
export class Index {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  comment: string;

  @Field(_type => [IndexColumn])
  columns: IndexColumn[];
}

export function fromDoltRowsRes(rows: RawRow[]): Index[] {
  return rows.map(r => {
    const cols = r.COLUMNS.split(",");
    return {
      name: r.INDEX_NAME,
      type: getIndexType(cols, r.NON_UNIQUE === "1"),
      comment: r.COMMENT,
      columns: cols.map(c => {
        return { name: c };
      }),
    };
  });
}

function getIndexType(cols: string[], nonUnique: boolean): string {
  if (cols.length > 1) return "Composite";
  if (!nonUnique) return "Unique";
  return "";
}
