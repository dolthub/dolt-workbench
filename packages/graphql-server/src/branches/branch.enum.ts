import { registerEnumType } from "@nestjs/graphql";

export enum SortBranchesBy {
  Unspecified,
  LastUpdated,
}

registerEnumType(SortBranchesBy, { name: "SortBranchesBy" });
