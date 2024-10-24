import { useDefaultBranchPageQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";

export default function useDefaultBranch(params: DatabaseParams) {
  const { data, ...res } = useDefaultBranchPageQuery({
    variables: { databaseName: params.databaseName, filterSystemTables: true },
  });
  return {
    ...res,
    defaultBranchName: data?.defaultBranch?.branchName ?? "main",
  };
}
