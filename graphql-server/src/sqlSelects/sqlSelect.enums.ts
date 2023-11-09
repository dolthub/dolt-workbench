import { registerEnumType } from "@nestjs/graphql";

export enum QueryExecutionStatus {
  Success,
  Error,
  Timeout,
  RowLimit,
}

registerEnumType(QueryExecutionStatus, { name: "QueryExecutionStatus" });
