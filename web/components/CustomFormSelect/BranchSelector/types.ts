import { Maybe } from "@dolthub/web-utils";
import { BranchForBranchSelectorFragment } from "@gen/graphql-types";
import { OptionalRefParams, TableParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { BaseFormSelectorProps } from "../types";

export type BranchSelectorForRepoProps = BaseFormSelectorProps & {
  params: OptionalRefParams & { tableName?: string };
  defaultName?: string;
  dataCyPrefix?: string;
  routeRefChangeTo?: RefUrl;
};

export type BranchSelectorProps<B extends BranchForBranchSelectorFragment> =
  BranchSelectorForRepoProps & {
    onChangeValue: (e: Maybe<string>) => void;
    branches: B[];
  };

export type BranchSelectorWithTableQueryProps = BranchSelectorForRepoProps & {
  params: TableParams;
};
