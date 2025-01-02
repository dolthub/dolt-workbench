import { useSetState } from "@dolthub/react-hooks";
import { RemoteFragment, usePushToRemoteMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { OptionalRefParams } from "@lib/params";
import { refetchRemoteBranchesQueries } from "@lib/refetchQueries";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { Dispatch, SyntheticEvent } from "react";
import { getDefaultState, PushToRemoteState } from "./state";

type ReturnType = {
  onClose: () => void;
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  state: PushToRemoteState;
  setState: Dispatch<Partial<PushToRemoteState>>;
};

export default function usePushToRemote(
  params: OptionalRefParams,
  remote: RemoteFragment,
  remoteBranch?: string,
  setIsOpen?: (o: boolean) => void,
): ReturnType {
  const { defaultBranchName } = useDefaultBranch(params);
  const [state, setState] = useSetState(
    getDefaultState(params.refName || defaultBranchName),
  );

  const { mutateFn: push, ...res } = useMutation({
    hook: usePushToRemoteMutation,
    refetchQueries: remoteBranch
      ? refetchRemoteBranchesQueries({
          databaseName: params.databaseName,
          toRefName: state.branchName,
          fromRefName: `${remote.name}/${remoteBranch}`,
        })
      : [],
  });

  const onClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
    setState({ err: undefined, branchName: "", message: "" });
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setState({ loading: true });
    const pushRes = await push({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName: remoteBranch
          ? `${state.branchName}:${remoteBranch}`
          : state.branchName,
      },
    });
    setState({ loading: false });
    if (!pushRes.data) {
      setState({ err: res.err });
      return;
    }
    const msg = pushRes.data.pushToRemote.message;
    if (!pushRes.data.pushToRemote.success) {
      setState({ err: new Error(msg) });
      return;
    }
    setState({ message: msg });
  };

  return {
    onSubmit,
    onClose,
    state,
    setState,
  };
}
