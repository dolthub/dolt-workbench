import { AheadBehindCountFragment, RemoteFragment } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { IoPushOutline } from "@react-icons/all-files/io5/IoPushOutline";
import usePullFromRemote from "../usePullFromRemote";
import usePushToRemote from "../usePushToRemote";
import css from "./index.module.css";

type SyncButtonProps = {
  numbers: AheadBehindCountFragment;
  remote: RemoteFragment;
  params: OptionalRefParams;
  remoteBranchName: string;
  currentBranch: string;
};

export default function SyncButton({
  numbers,
  params,
  remote,
  remoteBranchName,
  currentBranch,
}: SyncButtonProps) {
  const { onSubmit: onPull, err: pullErr } = usePullFromRemote(
    { ...params, refName: currentBranch },
    remote,
    remoteBranchName,
    currentBranch,
  );
  const { onSubmit: onPush, err: pushErr } = usePushToRemote(
    params,
    remote,
    currentBranch,
    remoteBranchName,
  );
  if (numbers.behind) {
    return (
      <div>
        <Button.Link onClick={onPull} className={css.button}>
          <IoPushOutline className={css.pullIcon} /> Pull
        </Button.Link>{" "}
        {pullErr && <ErrorMsg err={pullErr} />}
      </div>
    );
  }
  if (numbers.ahead) {
    return (
      <div>
        <Button.Link onClick={onPush} className={css.button}>
          <IoPushOutline /> Push
        </Button.Link>
        {pushErr && <ErrorMsg err={pushErr} />}
      </div>
    );
  }
  return <span>Up to date</span>;
}
