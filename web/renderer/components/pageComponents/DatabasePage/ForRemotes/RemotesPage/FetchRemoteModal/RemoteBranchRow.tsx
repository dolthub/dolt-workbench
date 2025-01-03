import { QueryHandler } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useRemoteBranchDiffCountsQuery,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { getBranchName } from "./utils";
import SyncButton from "./SyncButton";
import BehindAheadCount from "./BehindAheadCount";

type Props = {
  branch: BranchFragment;
  remote: RemoteFragment;
  currentBranch: string;
  params: OptionalRefParams;
};

export default function RemoteBranchRow({
  branch,
  remote,
  params,
  currentBranch,
}: Props) {
  const { branchNameWithRemoteName, remoteBranchName } = getBranchName(
    branch.branchName,
  );
  const res = useRemoteBranchDiffCountsQuery({
    variables: {
      databaseName: params.databaseName,
      toRefName: currentBranch,
      fromRefName: branchNameWithRemoteName,
    },
  });

  return (
    <QueryHandler
      result={res}
      render={data => (
        <tr>
          <td>{branchNameWithRemoteName}</td>
          <BehindAheadCount
            counts={data.remoteBranchDiffCounts}
            currentBranch={currentBranch}
            remoteAndBranchName={branchNameWithRemoteName}
          />
          <td>
            <SyncButton
              counts={data.remoteBranchDiffCounts}
              params={params}
              remote={remote}
              remoteBranchName={remoteBranchName}
              currentBranch={currentBranch}
            />
          </td>
        </tr>
      )}
    />
  );
}
