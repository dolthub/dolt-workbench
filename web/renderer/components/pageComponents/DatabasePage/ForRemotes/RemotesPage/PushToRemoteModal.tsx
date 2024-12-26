import { RemoteFragment } from "@gen/graphql-types";
import { useState } from "react";
import {
  Button,
  FormInput,
  Loader,
  ModalButtons,
  ModalInner,
  ModalOuter,
  SuccessMsg,
} from "@dolthub/react-components";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import usePushToRemote from "./usePushToRemote";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function PushToRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const { defaultBranchName } = useDefaultBranch(params);
  const [branchName, setBranchName] = useState(
    params.refName || defaultBranchName,
  );
  const {
    onClose,
    onSubmit,
    message,
    setMessage,

    loading,
    err,
    setErr,
  } = usePushToRemote(params, remote, branchName, setBranchName, setIsOpen);
  return (
    <ModalOuter isOpen={isOpen} onRequestClose={onClose} title="Push to remote">
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Update remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) with changes from the specified branch. To learn more
            about pushing to remotes, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-push">
              documentation
            </Link>
          </p>
          <FormInput
            value={branchName}
            label="Branch name"
            onChangeString={(s: string) => {
              setBranchName(s);
              setMessage("");
              setErr(undefined);
            }}
            placeholder="Enter branch name to push to remote"
            light
          />
        </ModalInner>
        <ModalButtons err={err} onRequestClose={onClose}>
          {message ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <Button type="submit" disabled={!branchName.length}>
              Push
            </Button>
          )}
        </ModalButtons>
        <PushMessage message={message} />
      </form>
      <Loader loaded={!loading} />
    </ModalOuter>
  );
}

type PushMessageProps = {
  message: string;
};

function PushMessage({ message }: PushMessageProps) {
  if (message.includes("Everything up-to-date")) {
    return <p className={css.message}>{message}</p>;
  }
  if (message) {
    return (
      <div className={css.message}>
        <SuccessMsg>Push successful</SuccessMsg>
        <p>{message}</p>
      </div>
    );
  }
  return <div />;
}
