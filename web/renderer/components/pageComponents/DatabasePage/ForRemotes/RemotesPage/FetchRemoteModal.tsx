import {
  RemoteFragment,
  useFetchRemoteMutation,
  useRemoteBranchesQuery,
} from "@gen/graphql-types";
import {
  Button,
  FormInput,
  Loader,
  ModalButtons,
  ModalInner,
  ModalOuter,
  SuccessMsg,
} from "@dolthub/react-components";
import { SyntheticEvent, useState } from "react";
import useMutation from "@hooks/useMutation";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import useDefaultBranch from "@hooks/useDefaultBranch";
import css from "./index.module.css";
import RemoteBranches from "./RemoteBranches";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function FetchFromRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const { defaultBranchName } = useDefaultBranch(params);
  const [branchName, setBranchName] = useState(
    params.refName || defaultBranchName,
  );
  const { mutateFn: fetch, ...res } = useMutation({
    hook: useFetchRemoteMutation,
  });
  const [message, setMessage] = useState("");

  const remotebranchres = useRemoteBranchesQuery({
    variables: {
      databaseName: params.databaseName,
    },
  });
  console.log(remotebranchres.data);
  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setBranchName("");
    setMessage("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const fetchRes = await fetch({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!fetchRes.data?.fetchRemote.success) {
      setMessage("");
      return;
    }
    setMessage("Fetch successful");
  };

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Fetch from remote"
      className={css.fetchModal}
    >
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Update remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) tracking branches. To learn more about fetch remotes,
            see our{" "}
            <Link href="https://docs.dolthub.com/sql-reference/version-control/dolt-sql-procedures#dolt_fetch">
              documentation
            </Link>
          </p>
          <RemoteBranches params={params} remote={remote} />
        </ModalInner>
        <ModalButtons err={res.err} onRequestClose={onClose}>
          <Button type="submit">Fetch</Button>
        </ModalButtons>
        {message && <SuccessMsg className={css.message}>{message}</SuccessMsg>}
      </form>
      <Loader loaded={!res.loading} />
    </ModalOuter>
  );
}
