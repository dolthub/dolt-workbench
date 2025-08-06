import { DocType } from "@gen/graphql-types";

export default function toDocType(t: string | undefined): DocType {
  switch (t) {
    case "README.md":
      return DocType.Readme;
    case "LICENSE.md":
      return DocType.License;
    case "AGENT.md":
      return DocType.Agent;
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
    case DocType.Agent:
      return "AGENT.md";
    default:
      return undefined;
  }
}
