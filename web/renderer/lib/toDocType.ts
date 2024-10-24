import { DocType } from "@gen/graphql-types";

export default function toDocType(t: string | undefined): DocType {
  switch (t) {
    case "README.md":
      return DocType.Readme;
    case "LICENSE.md":
      return DocType.License;
    default:
      return DocType.Unspecified;
  }
}

export function fromDocType(t: DocType): string | undefined {
  switch (t) {
    case DocType.Readme:
      return "README.md";
    case DocType.License:
      return "LICENSE.md";
    default:
      return undefined;
  }
}
