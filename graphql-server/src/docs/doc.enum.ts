import { registerEnumType } from "@nestjs/graphql";
import { Row } from "../rows/row.model";

export enum DocType {
  Unspecified = "Unspecified",
  Readme = "README.md",
  License = "LICENSE.md",
}

registerEnumType(DocType, { name: "DocType" });

export function toDocType(r: Row): DocType {
  switch (r.columnValues[0].displayValue) {
    case "README.md":
      return DocType.Readme;
    case "LICENSE.md":
      return DocType.License;
    default:
      return DocType.Unspecified;
  }
}
