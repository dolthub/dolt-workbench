import QueryHandler from "@components/util/QueryHandler";
import { useBranchesForSelectorQuery } from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { RefUrl } from "@lib/urls";
import BranchSelectorQuery from "./BranchSelectorQuery";
import BranchSelectorWithTableQuery from "./BranchSelectorWithTableQuery";
import Inner from "./Inner";
import { BranchSelectorForRepoProps } from "./types";

export function BranchSelector(props: BranchSelectorForRepoProps) {
  const { refName, tableName } = props.params;

  if (refName && tableName) {
    const params = { ...props.params, refName, tableName };
    return <BranchSelectorWithTableQuery {...props} params={params} />;
  }
  return <BranchSelectorQuery {...props} />;
}

type CustomProps = BranchSelectorForRepoProps & {
  onChangeValue: (e: string) => void;
  routeRefChangeTo?: RefUrl;
};

export default function CustomBranchSelector(props: CustomProps): JSX.Element {
  const { defaultBranchName } = useDefaultBranch(props.params);

  const res = useBranchesForSelectorQuery({
    variables: props.params,
    fetchPolicy: "cache-and-network",
  });

  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner
          {...props}
          branches={data.branches.list}
          defaultName={props.defaultName ?? defaultBranchName}
        />
      )}
    />
  );
}
