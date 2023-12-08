import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";

@ObjectType()
export class ForeignKeyColumn {
  @Field()
  referencedColumnName: string;

  @Field()
  referrerColumnIndex: number;
}

@ObjectType()
export class ForeignKey {
  @Field()
  tableName: string;

  @Field()
  columnName: string;

  @Field()
  referencedTableName: string;

  @Field(_type => [ForeignKeyColumn])
  foreignKeyColumn: ForeignKeyColumn[];
}

export function fromDoltRowsRes(rows: RawRow[]): ForeignKey[] {
  const nameMap: Record<string, ForeignKey> = {};
  rows.forEach(row => {
    if (row.CONSTRAINT_NAME in nameMap) {
      nameMap[row.CONSTRAINT_NAME].foreignKeyColumn.push({
        referencedColumnName: row.REFERENCED_COLUMN_NAME,
        referrerColumnIndex: row.ORDINAL_POSITION - 1,
      });
    } else {
      nameMap[row.CONSTRAINT_NAME] = {
        tableName: row.TABLE_NAME,
        columnName: row.COLUMN_NAME,
        referencedTableName: row.REFERENCED_TABLE_NAME,
        foreignKeyColumn: [
          {
            referencedColumnName: row.REFERENCED_COLUMN_NAME,
            referrerColumnIndex: row.ORDINAL_POSITION - 1,
          },
        ],
      };
    }
  });
  return Object.values(nameMap);
}
