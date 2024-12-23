import { ErrorMsg, Loader, QueryHandler } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useBranchesForSelectorQuery,
  useRemoteBranchesQuery,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import css from "./index.module.css";
import RemoteBranchRow from "./RemoteBranchRow";
import useDefaultBranch from "@hooks/useDefaultBranch";

type Props = {
  params: OptionalRefParams;
  remote: RemoteFragment;
};

type InnerProps = Props & {
  remoteBranches: BranchFragment[];
  currentBranch: string;
};

function Inner({ remoteBranches, params, remote }: InnerProps) {
  return (
    <table className={css.table}>
      <thead>
        <tr>
          <th>Branch</th>
          <th>Behind|Ahead</th>
          <th>Sync</th>
        </tr>
      </thead>
      <tbody>
        {remoteBranches.map(rb => (
          <RemoteBranchRow key={rb._id} branch={rb} remote={remote} />
        ))}
      </tbody>
    </table>
  );
}

export default function RemoteBranches({ params, remote }: Props) {
  const res = useRemoteBranchesQuery({
    variables: {
      databaseName: params.databaseName,
    },
  });
  const branchesRes = useBranchesForSelectorQuery({ variables: params });
  const { defaultBranchName } = useDefaultBranch(params);
  const currentBranchName = params.refName || defaultBranchName;
  if (branchesRes.error) {
    return <ErrorMsg err={branchesRes.error} />;
  }
  if (branchesRes.loading) {
    return <Loader loaded={!branchesRes.loading} />;
  }
  return (
    <QueryHandler
      result={{ ...res, data: res.data?.remoteBranches.list }}
      render={data => (
        <Inner
          remoteBranches={data}
          params={params}
          currentBranch={currentBranchName}
          remote={remote}
        />
      )}
    />
  );
}
