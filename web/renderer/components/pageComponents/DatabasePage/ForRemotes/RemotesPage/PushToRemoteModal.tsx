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
  const [message, setMessage] = useState("");
  const { mutateFn: push, ...res } = useMutation({
    hook: usePushToRemoteMutation,
  });

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

    const msg = pushRes.data.pushToRemote.message;
    if (pushRes.data.pushToRemote.status !== "0") {
      res.setErr(new Error(msg));
      return;
    }
    if (msg.includes("Everything up-to-date")) {
      setMessage(msg);
      return;
    }
    setMessage(`Pushing succeeded!\n ${msg}`);
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
            onChangeString={(s: string) => {
              setBranchName(s);
              setMessage("");
              res.setErr(undefined);
            }}
            placeholder="Enter push from branch name"
            light
          />
        </ModalInner>
        <ModalButtons err={res.err} onRequestClose={onClose}>
          <Button type="submit" disabled={!branchName.length}>
            Start pushing
          </Button>
        </ModalButtons>
        <p className={css.message}>{message}</p>
      </form>
      <Loader loaded={!res.loading} />
    </ModalOuter>
  );
}
