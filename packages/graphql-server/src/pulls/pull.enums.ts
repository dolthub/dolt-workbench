import { registerEnumType } from "@nestjs/graphql";

export enum PullState {
  Open,
  Merged,
  Unspecified,
}

registerEnumType(PullState, { name: "PullState" });
