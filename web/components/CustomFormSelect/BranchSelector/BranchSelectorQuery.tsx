import QueryHandler from "@components/util/QueryHandler";
import { useBranchesForSelectorQuery } from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import Inner from "./Inner";
import { BranchSelectorForRepoProps } from "./types";

export default function BranchSelectorQuery(props: BranchSelectorForRepoProps) {
  const { defaultBranchName } = useDefaultBranch(props.params);

  const res = useBranchesForSelectorQuery({
    variables: {
      databaseName: props.params.databaseName,
    },
  });
  const router = useRouter();

  const handleChangeBranch = async (branchName: string) => {
    const { href, as } = props.routeRefChangeTo
      ? props.routeRefChangeTo({
          ...props.params,
          refName: branchName,
        })
      : database(props.params);

    router.push(href, as).catch(console.error);
  };

  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner
          {...props}
          onChangeValue={handleChangeBranch}
          branches={data.allBranches}
          defaultName={props.defaultName ?? defaultBranchName}
        />
      )}
    />
  );
}
