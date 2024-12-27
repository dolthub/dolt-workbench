import { RemoteFragment, usePullFromRemoteMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { ApolloErrorType } from "@lib/errors/types";
import { OptionalRefParams } from "@lib/params";
import {
  refetchRemoteBranchesQueries,
  refetchUpdateDatabaseQueriesCacheEvict,
} from "@lib/refetchQueries";
import { ref } from "@lib/urls";
import router from "next/router";
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

export default function usePullFromRemote(
  params: OptionalRefParams,
  remote: RemoteFragment,
  branchName: string,
  currentBranch?: string,
  setBranchName?: (b: string) => void,
  setIsOpen?: (o: boolean) => void,
): ReturnType {
  const { mutateFn: pull, ...res } = useMutation({
    hook: usePullFromRemoteMutation,
    refetchQueries: currentBranch
      ? refetchRemoteBranchesQueries({
          databaseName: params.databaseName,
          toRefName: currentBranch,
          fromRefName: `${remote.name}/${branchName}`,
        })
      : [],
  });
  const [message, setMessage] = useState("");

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
    const { href, as } = ref(params);
    router.push(href, as).catch(console.error);
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
