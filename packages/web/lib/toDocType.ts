import { DocType } from "@gen/graphql-types";

export default function toDocType(t: string | undefined) {
  switch (t) {
    case "README.md":
      return DocType.Readme;
    case "LICENSE.md":
      return DocType.License;
    default:
      return DocType.Unspecified;
  }
}
