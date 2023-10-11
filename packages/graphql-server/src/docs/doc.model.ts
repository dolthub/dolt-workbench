import { Field, ObjectType } from "@nestjs/graphql";
import { Row } from "../rows/row.model";
import { RawRow } from "../utils/commonTypes";
import { DocType } from "./doc.enum";

@ObjectType()
export class Doc {
  @Field()
  docType: DocType;

  @Field({ nullable: true })
  docRow?: Row;

  @Field()
  branchName: string;
}

@ObjectType()
export class DocList {
  @Field(_type => [Doc])
  list: Doc[];
}

@ObjectType()
export class EditDocRes {
  @Field()
  newBranchName: string;

  @Field(_type => Doc, { nullable: true })
  doc?: Doc;
}

export function fromDoltDocsRow(branchName: string, doc: RawRow): Doc {
  return {
    branchName,
    docRow: {
      columnValues: [
        { displayValue: doc.doc_name },
        { displayValue: doc.doc_text },
      ],
    },
    docType: doc.doc_name,
  };
}
