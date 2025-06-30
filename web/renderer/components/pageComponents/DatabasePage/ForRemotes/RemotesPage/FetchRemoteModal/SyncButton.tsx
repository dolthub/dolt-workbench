import { Button, ErrorMsg, SmallLoader } from "@dolthub/react-components";
import {
  RemoteBranchDiffCountsFragment,
  RemoteFragment,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { GoCheck } from "@react-icons/all-files/go/GoCheck";
import { IoPushOutline } from "@react-icons/all-files/io5/IoPushOutline";
import usePullFromRemote from "../usePullFromRemote";
import usePushToRemote from "../usePushToRemote";
import css from "./index.module.css";

type SyncButtonProps = {
  counts: RemoteBranchDiffCountsFragment;
  remote: RemoteFragment;
  params: OptionalRefParams;
  remoteBranchName: string;
};

export default function SyncButton({
  counts,
  params,
  remote,
  remoteBranchName,
}: SyncButtonProps) {
  const {
    onSubmit: onPull,
    err: pullErr,
    loading: pullLoading,
    message,
  } = usePullFromRemote(
    { ...params, refName: remoteBranchName },
    remote,
    remoteBranchName,
    remoteBranchName,
  );
  const { onSubmit: onPush, state } = usePushToRemote(
    params,
    remote,
    remoteBranchName,
  );
  const { ahead, behind } = counts;
  if (!ahead && !behind) {
    return (
      <span className={css.upToDate}>
        <GoCheck />
        Up to date
      </span>
    );
  }
  return (
    <div>
      <div className={css.buttons}>
        {!!behind && (
          <Button.Link onClick={onPull} className={css.button}>
            <SmallLoader loaded={!pullLoading} />
            <IoPushOutline className={css.pullIcon} /> Pull
          </Button.Link>
        )}
        {!!ahead && (
          <Button.Link onClick={onPush} className={css.button}>
            <SmallLoader loaded={!state.loading} />
            <IoPushOutline /> Push
          </Button.Link>
        )}
      </div>
      {pullErr && <ErrorMsg err={pullErr} />}
      {state.err && <ErrorMsg err={state.err} />}
      {message && <span>{message}</span>}
      {state.message && <span>{state.message}</span>}
    </div>
  );
}
