import { registerEnumType } from "@nestjs/graphql";

export enum SchemaType {
  View,
  Procedure,
  Event,
  Trigger,
  Table,
}

registerEnumType(SchemaType, { name: "SchemaType" });
