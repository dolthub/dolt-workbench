import { RemoteFragment, usePushToRemoteMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { ApolloErrorType } from "@lib/errors/types";
import { OptionalRefParams } from "@lib/params";
import { refetchRemoteBranchesQueries } from "@lib/refetchQueries";
import { SyntheticEvent, useState } from "react";

type ReturnType = {
  onClose: () => void;
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  message: string;
  setMessage: (m: string) => void;
  loading?: boolean;
  err: ApolloErrorType | undefined;
  setErr: (err: ApolloErrorType) => void;
};

export default function usePushToRemote(
  params: OptionalRefParams,
  remote: RemoteFragment,
  localBranchName: string,
  remoteBranch?: string,
  setBranchName?: (b: string) => void,
  setIsOpen?: (o: boolean) => void,
): ReturnType {
  const [message, setMessage] = useState("");
  const { mutateFn: push, ...res } = useMutation({
    hook: usePushToRemoteMutation,
    refetchQueries: remoteBranch
      ? refetchRemoteBranchesQueries({
          databaseName: params.databaseName,
          toRefName: localBranchName,
          fromRefName: `${remote.name}/${remoteBranch}`,
        })
      : [],
  });

  const onClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
    res.setErr(undefined);
    if (setBranchName) {
      setBranchName("");
    }
    setMessage("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const pushRes = await push({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName: remoteBranch
          ? `${localBranchName}:${remoteBranch}`
          : localBranchName,
      },
    });
    if (!pushRes.data) {
      return;
    }
    const msg = pushRes.data.pushToRemote.message;
    if (!pushRes.data.pushToRemote.success) {
      res.setErr(new Error(msg));
      return;
    }
    setMessage(msg);
  };

  return {
    onSubmit,
    onClose,
    message,
    setMessage,
    loading: res.loading,
    err: res.err,
    setErr: res.setErr,
  };
}
