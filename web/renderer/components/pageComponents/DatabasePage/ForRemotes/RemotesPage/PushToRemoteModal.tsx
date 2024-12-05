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
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import useDefaultBranch from "@hooks/useDefaultBranch";
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
    const pushRes = await push({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!pushRes.data) {
      return;
    }
    if (pushRes.data.pushToRemote.status !== "0") {
      res.setErr(new Error(pushRes.data.pushToRemote.message));
      return;
    }
    const { href, as } = database(params);
    router.push(href, as).catch(console.error);
  };

  return (
    <ModalOuter isOpen={isOpen} onRequestClose={onClose} title="Push to remote">
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Update remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) with current branch. To learn more about push to a
            remote, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-push">
              documentation
            </Link>
          </p>
          <FormInput
            value={branchName}
            label="Push from branch name"
            onChangeString={setBranchName}
            placeholder="Enter push from branch name"
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
