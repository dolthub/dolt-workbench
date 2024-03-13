import QueryHandler from "@components/util/QueryHandler";
import { Maybe } from "@dolthub/web-utils";
import {
  useBranchesForSelectorQuery,
  useTableNamesLazyQuery,
} from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { ref } from "@lib/urls";
import { useRouter } from "next/router";
import Inner from "./Inner";
import { BranchSelectorWithTableQueryProps } from "./types";

export default function BranchSelectorWithTableQuery(
  props: BranchSelectorWithTableQueryProps,
) {
  const { defaultBranchName } = useDefaultBranch(props.params);
  const [getTableNames] = useTableNamesLazyQuery();

  const res = useBranchesForSelectorQuery({
    variables: {
      databaseName: props.params.databaseName,
    },
    fetchPolicy: "network-only",
  });
  const router = useRouter();

  const handleChangeBranch = async (branchName: Maybe<string>) => {
    if (!branchName) return;
    const variables = {
      databaseName: props.params.databaseName,
      refName: branchName,
    };
    const tableRes = await getTableNames({ variables });
    const tableExists = tableRes.data?.tableNames.list.some(
      t => t === props.params.tableName,
    );
    const { href, as } =
      tableExists && props.routeRefChangeTo
        ? props.routeRefChangeTo({
            ...props.params,
            refName: branchName,
          })
        : ref({ ...props.params, refName: branchName });

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
