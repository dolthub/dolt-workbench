import { RemoteFragment, usePullFromRemoteMutation } from "@gen/graphql-types";
import {
  Button,
  FormInput,
  Loader,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import { SyntheticEvent, useState } from "react";
import useMutation from "@hooks/useMutation";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { database } from "@lib/urls";
import router from "next/router";
import useDefaultBranch from "@hooks/useDefaultBranch";
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
  const { mutateFn: pull, ...res } = useMutation({
    hook: usePullFromRemoteMutation,
  });
  const [message, setMessage] = useState("");

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setBranchName("");
    setMessage("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const pullRes = await pull({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!pullRes.data) return;
    const msg = pullRes.data.pullFromRemote.message;
    if (
      pullRes.data.pullFromRemote.conflicts ||
      msg.includes("cannot fast forward")
    ) {
      res.setErr(new Error(msg));
      return;
    }

    if (msg === "Everything up-to-date") {
      setMessage(msg);
      return;
    }
    await res.client
      .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
      .catch(console.error);
    const { href, as } = database(params);
    router.push(href, as).catch(console.error);
  };

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
              res.setErr(undefined);
            }}
            placeholder="Enter branch name from the remote to pull from"
            light
          />
        </ModalInner>
        <ModalButtons err={res.err} onRequestClose={onClose}>
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
      <Loader loaded={!res.loading} />
    </ModalOuter>
  );
}
