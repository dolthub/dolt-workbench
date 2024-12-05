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
import { DatabaseParams } from "@lib/params";
import Link from "@components/links/Link";
import { refetchUpdateQueriesCacheEvict } from "@lib/refetchQueries";
import { database } from "@lib/urls";
import router from "next/router";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: DatabaseParams;
};

export default function PullFromModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const [branchName, setBranchName] = useState("");
  const { mutateFn: pull, ...res } = useMutation({
    hook: usePullFromRemoteMutation,
  });

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setBranchName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { success } = await pull({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!success) return;
    await res.client
      .refetchQueries(refetchUpdateQueriesCacheEvict)
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
            {remote.url}) and merge into current branch main. To learn more
            about pull from a remote, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-pull">
              documentation
            </Link>
          </p>
          <FormInput
            value={branchName}
            label="Remote branch name"
            onChangeString={setBranchName}
            placeholder="Enter remote branch name"
            light
          />
        </ModalInner>
        <ModalButtons err={res.err} onRequestClose={onClose}>
          <Button type="submit" disabled={!branchName.length}>
            Start pulling
          </Button>
        </ModalButtons>
      </form>
      <Loader loaded={!res.loading} />
    </ModalOuter>
  );
}
