import { FormSelectTypes } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import {
  BranchForBranchSelectorFragment,
  useBranchesForSelectorQuery,
} from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";

type ReturnType = {
  branchOptions: Array<FormSelectTypes.Option<string>>;
  error?: ApolloErrorType;
  loading: boolean;
  defaultBranch?: string;
};

export default function useGetBranchOptionsForSelect(
  params: DatabaseParams,
): ReturnType {
  const branchRes = useBranchesForSelectorQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });

  const branchOptions =
    branchRes.data?.allBranches.map(b => {
      return {
        value: b.branchName,
        label: excerpt(b.branchName, 45),
      };
    }) ?? [];

  return {
    branchOptions,
    error: branchRes.error,
    loading: branchRes.loading,
    defaultBranch: getDefaultBranch(branchRes.data?.allBranches),
  };
}

function getDefaultBranch(
  branches?: BranchForBranchSelectorFragment[],
): string | undefined {
  if (!branches?.length) return undefined;
  const mainBranch = branches.find(b => b.branchName === "main");
  if (mainBranch) return mainBranch.branchName;
  return branches[0].branchName;
}
