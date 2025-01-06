import { ErrorMsg, Loader, QueryHandler } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useBranchesForSelectorQuery,
  useRemoteBranchesQuery,
} from "@gen/graphql-types";
import { pluralize } from "@dolthub/web-utils";
import { OptionalRefParams } from "@lib/params";
import RemoteBranchRow from "./RemoteBranchRow";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  remote: RemoteFragment;
  currentBranch: string;
};

type InnerProps = Props & {
  remoteBranches: BranchFragment[];
};

function Inner(props: InnerProps) {
  return (
    <table className={css.table}>
      <thead>
        <tr>
          <th>Remote {pluralize(props.remoteBranches.length, "branch")}</th>
          <th>Behind | Ahead</th>
          <th>Sync</th>
        </tr>
      </thead>
      <tbody>
        {props.remoteBranches.map(rb => (
          <RemoteBranchRow {...props} key={rb._id} branch={rb} />
        ))}
      </tbody>
    </table>
  );
}

export default function RemoteBranches({
  params,
  remote,
  currentBranch,
}: Props) {
  const res = useRemoteBranchesQuery({
    variables: {
      databaseName: params.databaseName,
    },
  });
  const branchesRes = useBranchesForSelectorQuery({ variables: params });
  if (branchesRes.loading) {
    return <Loader loaded={!branchesRes.loading} />;
  }
  if (branchesRes.error) {
    return <ErrorMsg err={branchesRes.error} />;
  }

  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner
          remoteBranches={data.remoteBranches.list}
          params={params}
          currentBranch={currentBranch}
          remote={remote}
        />
      )}
    />
  );
}
