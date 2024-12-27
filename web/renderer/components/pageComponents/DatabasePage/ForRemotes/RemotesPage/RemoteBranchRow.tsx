import { Button, ErrorMsg, QueryHandler } from "@dolthub/react-components";
import {
  AheadOrBehindFragment,
  BranchFragment,
  RemoteFragment,
  useMergeBaseQuery,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { IoPushOutline } from "@react-icons/all-files/io5/IoPushOutline";
import css from "./index.module.css";
import usePullFromRemote from "./usePullFromRemote";
import usePushToRemote from "./usePushToRemote";

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
  const res = useMergeBaseQuery({
    variables: {
      databaseName: params.databaseName,
      branchName: currentBranch,
      anotherBranch: remoteAndBranchName,
    },
  });

  return (
    <QueryHandler
      result={{ ...res, data: res.data?.mergeBase }}
      render={data => (
        <tr>
          <td>{remoteAndBranchName}</td>
          <td>
            {data.behind}|{data.ahead}
          </td>
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

type SyncButtonProps = {
  numbers: AheadOrBehindFragment;
  remote: RemoteFragment;
  params: OptionalRefParams;
  remoteBranchName: string;
  currentBranch: string;
};

function SyncButton({
  numbers,
  params,
  remote,
  remoteBranchName,
  currentBranch,
}: SyncButtonProps) {
  const { onSubmit: onPull, err: pullErr } = usePullFromRemote(
    params,
    remote,
    remoteBranchName,
    currentBranch,
  );
  const { onSubmit: onPush, err: pushErr } = usePushToRemote(
    params,
    remote,
    currentBranch,
     remoteBranchName ,
  );
  if (numbers.behind) {
    return (
      <div>
        <Button onClick={onPull}>
          <IoPushOutline className={css.pullIcon} /> Pull
        </Button>{" "}
        {pullErr && <ErrorMsg err={pullErr} />}
      </div>
    );
  }
  if (numbers.ahead) {
    return (
      <div>
        <Button onClick={onPush}>
          <IoPushOutline /> Push
        </Button>
        {pushErr && <ErrorMsg err={pushErr} />}
      </div>
    );
  }
  return <span>Up to date</span>;
}

type ReturnType = {
  remoteAndBranchName: string;
  remoteBranchName: string;
};
function getBranchName(branchName: string): ReturnType {
  if (branchName.startsWith("remotes/")) {
    const remoteAndBranchName = branchName.slice(8);
    const remoteBranchName = remoteAndBranchName.split("/").slice(1).join("/");
    return {
      remoteAndBranchName,
      remoteBranchName,
    };
  }
  const remoteBranchName = branchName.split("/").slice(1).join("");
  return { remoteAndBranchName: branchName, remoteBranchName };
}
