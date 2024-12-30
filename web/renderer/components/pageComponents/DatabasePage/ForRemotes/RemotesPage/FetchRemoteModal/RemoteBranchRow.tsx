import { QueryHandler } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useAheadBehindCountQuery,
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
  const { remoteAndBranchName, remoteBranchName } = getBranchName(
    branch.branchName,
  );
  const res = useAheadBehindCountQuery({
    variables: {
      databaseName: params.databaseName,
      toRefName: currentBranch,
      fromRefName: remoteAndBranchName,
    },
  });

  return (
    <QueryHandler
      result={{ ...res, data: res.data?.aheadBehindCount }}
      render={data => (
        <tr>
          <td>{remoteAndBranchName}</td>
          <BehindAheadCount
            numbers={data}
            currentBranch={currentBranch}
            remoteAndBranchName={remoteAndBranchName}
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
