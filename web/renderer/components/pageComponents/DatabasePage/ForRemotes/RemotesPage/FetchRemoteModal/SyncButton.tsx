import {
  AheadAndBehindCountFragment,
  RemoteFragment,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { IoPushOutline } from "@react-icons/all-files/io5/IoPushOutline";
import { GoCheck } from "@react-icons/all-files/go/GoCheck";
import usePullFromRemote from "../usePullFromRemote";
import usePushToRemote from "../usePushToRemote";
import css from "./index.module.css";

type SyncButtonProps = {
  numbers: AheadAndBehindCountFragment;
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
  if (!numbers.ahead && !numbers.behind) {
    return (
      <span className={css.upToDate}>
        <GoCheck />
        Up to date
      </span>
    );
  }
  return (
    <div className={css.buttons}>
      {!!numbers.behind && (
        <div>
          <Button.Link onClick={onPull} className={css.button}>
            <IoPushOutline className={css.pullIcon} /> Pull
          </Button.Link>{" "}
          {pullErr && <ErrorMsg err={pullErr} />}
        </div>
      )}
      {!!numbers.ahead && (
        <div>
          <Button.Link onClick={onPush} className={css.button}>
            <IoPushOutline /> Push
          </Button.Link>
          {pushErr && <ErrorMsg err={pushErr} />}
        </div>
      )}
    </div>
  );
}
