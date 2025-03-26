import { RemoteFragment } from "@gen/graphql-types";
import { useState } from "react";
import useDefaultBranch from "@hooks/useDefaultBranch";
import {
  Button,
  FormInput,
  Loader,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import usePullFromRemote from "./usePullFromRemote";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function PullFromRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const { defaultBranchName } = useDefaultBranch(params);
  const pullIntoBranch = params.refName || defaultBranchName;
  const [branchName, setBranchName] = useState("");

  const {
    onSubmit,
    onClose,
    message,
    setMessage,
    loading,
    err,
    setErr,
  } = usePullFromRemote(
    { ...params, refName: pullIntoBranch },
    remote,
    branchName,
    undefined,
    setBranchName,
    setIsOpen,
  );

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Pull from remote"
    >
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Fetch from remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) and merge into current branch{" "}
            <span className={css.bold}>{pullIntoBranch}</span>. To learn more
            about pulling from remotes, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-pull">
              documentation
            </Link>
          </p>
          <FormInput
            value={branchName}
            label="Remote branch name"
            onChangeString={(s: string) => {
              setBranchName(s);
              setMessage("");
              setErr(undefined);
            }}
            placeholder="Enter branch name from the remote to pull from"
            light
          />
        </ModalInner>
        <ModalButtons err={err} onRequestClose={onClose}>
          {message.includes("Everything up-to-date") ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <Button type="submit" disabled={!branchName.length}>
              Pull
            </Button>
          )}
        </ModalButtons>
        {message && <p className={css.message}>{message}</p>}
      </form>
      <Loader loaded={!loading} />
    </ModalOuter>
  );
}
