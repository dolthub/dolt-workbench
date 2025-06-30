import { ErrorMsg, Loader, QueryHandler } from "@dolthub/react-components";
import { pluralize } from "@dolthub/web-utils";
import {
  BranchFragment,
  RemoteFragment,
  useBranchesForSelectorQuery,
  useRemoteBranchesQuery,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import RemoteBranchRow from "./RemoteBranchRow";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  remote: RemoteFragment;
};

type InnerProps = Props & {
  remoteBranches: BranchFragment[];
};

function Inner(props: InnerProps) {
  return (
    <table className={css.table} data-cy="fetch-from-remote-table">
      <thead>
        <tr>
          <th>Remote {pluralize(props.remoteBranches.length, "branch")}</th>
          <th>Behind | Ahead</th>
          <th>Sync</th>
          <th>Diff</th>
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

export default function RemoteBranches({ params, remote }: Props) {
  const res = useRemoteBranchesQuery({
    variables: {
      databaseName: params.databaseName,
      remoteName: remote.name,
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
          remote={remote}
        />
      )}
    />
  );
}
