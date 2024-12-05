import { RemoteFragment, usePushToRemoteMutation } from "@gen/graphql-types";
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
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: DatabaseParams;
};

export default function PushToRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const [branchName, setBranchName] = useState("");
  const { mutateFn: push, ...res } = useMutation({
    hook: usePushToRemoteMutation,
  });
  const router = useRouter();

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setBranchName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { success } = await push({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!success) return;
    const { href, as } = database(params);
    router.push(href, as).catch(console.error);
  };

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Create new database"
    >
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Update remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) with current branch main. To learn more about push to
            a remote, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-push">
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
            Start pushing
          </Button>
        </ModalButtons>
      </form>
      <Loader loaded={!res.loading} />
    </ModalOuter>
  );
}
