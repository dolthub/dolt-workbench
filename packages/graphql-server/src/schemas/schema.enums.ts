import { registerEnumType } from "@nestjs/graphql";

export enum SchemaType {
  View = "view",
  Procedure = "procedure",
  Event = "event",
  Trigger = "trigger",
  Table = "table",
}

registerEnumType(SchemaType, { name: "SchemaType" });
