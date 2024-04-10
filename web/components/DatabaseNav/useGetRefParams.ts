import { useGetBranchQuery, useGetTagQuery } from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { RefParams } from "@lib/params";

export default function useGetRefParams(params: RefParams) {
  const { defaultBranchName } = useDefaultBranch(params);

  const checkBranchExistRes = useGetBranchQuery({
    variables: {
      databaseName: params.databaseName,
      branchName: params.refName,
    },
  });

  const tagRes = useGetTagQuery({
    variables: {
      databaseName: params.databaseName,
      tagName: params.refName,
    },
  });

  return {
    loading: tagRes.loading || checkBranchExistRes.loading,
    refName:
      checkBranchExistRes.data?.branch || tagRes.data?.tag
        ? params.refName
        : defaultBranchName,
  };
}
