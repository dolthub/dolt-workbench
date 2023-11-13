import { registerEnumType } from "@nestjs/graphql";

export enum QueryExecutionStatus {
  Success,
  Error,
  Timeout,
}

registerEnumType(QueryExecutionStatus, { name: "QueryExecutionStatus" });
