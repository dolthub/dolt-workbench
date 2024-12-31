import { QueryHandler } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useAheadAndBehindCountQuery,
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
  const { branchNameWithRemotePrefix, remoteBranchName } = getBranchName(
    branch.branchName,
  );
  const res = useAheadAndBehindCountQuery({
    variables: {
      databaseName: params.databaseName,
      toRefName: currentBranch,
      fromRefName: branchNameWithRemotePrefix,
    },
  });

  return (
    <QueryHandler
      result={{ ...res, data: res.data?.aheadAndBehindCount }}
      render={data => (
        <tr>
          <td>{branchNameWithRemotePrefix}</td>
          <BehindAheadCount
            numbers={data}
            currentBranch={currentBranch}
            remoteAndBranchName={branchNameWithRemotePrefix}
          />
          <td>
            <SyncButton
              numbers={data}
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
