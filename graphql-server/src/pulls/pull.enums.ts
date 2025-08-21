import { registerEnumType } from "@nestjs/graphql";

export enum PullState {
  Open,
  Merged,
  Unspecified,
}

registerEnumType(PullState, { name: "PullState" });

export enum ConflictResolveType {
  Ours = "ours",
  Theirs = "theirs",
}

registerEnumType(ConflictResolveType, { name: "ConflictResolveType" });
