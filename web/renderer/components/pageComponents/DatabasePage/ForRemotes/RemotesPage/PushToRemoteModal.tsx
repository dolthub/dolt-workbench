import { RemoteFragment, usePushToRemoteMutation } from "@gen/graphql-types";
import { ModalOuter } from "@dolthub/react-components";
import { SyntheticEvent, useState } from "react";
import useMutation from "@hooks/useMutation";
import { DatabaseParams } from "@lib/params";
import PullOrPushRemoteModal from "./Modal";

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
  const { mutateFn: push, ...pullRes } = useMutation({
    hook: usePushToRemoteMutation,
  });

  const onClose = () => {
    setIsOpen(false);
    pullRes.setErr(undefined);
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
    // if (!success) return;
  };

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Create new database"
    >
      <PullOrPushRemoteModal
        onClose={onClose}
        onSubmit={onSubmit}
        branchName={branchName}
        setBranchName={setBranchName}
        err={pullRes.err}
        label="pull from remote"
      />
    </ModalOuter>
  );
}
