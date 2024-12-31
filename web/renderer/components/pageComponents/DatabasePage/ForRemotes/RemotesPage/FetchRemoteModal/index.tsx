import { RemoteFragment } from "@gen/graphql-types";
import {
  Button,
  ModalButtons,
  ModalInner,
  ModalOuter,
  SuccessMsg,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import useDefaultBranch from "@hooks/useDefaultBranch";
import RefLink from "@components/links/RefLink";
import Link from "@components/links/Link";
import RemoteBranches from "./RemoteBranches";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function FetchRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
}: Props) {
  const onClose = () => {
    setIsOpen(false);
  };
  const { defaultBranchName } = useDefaultBranch(params);
  const currentBranch = params.refName || defaultBranchName;

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Sync with remote"
      className={css.fetchModal}
    >
      <ModalInner>
        <SuccessMsg>Fetch completed successfully.</SuccessMsg>
        <p>
          Synchronize the local branch{" "}
          <RefLink params={{ ...params, refName: currentBranch }}>
            {params.refName}
          </RefLink>{" "}
          with the remote <span className={css.bold}>{remote.name}</span> (
          {remote.url}) branches. To learn more about fetch remotes, see our{" "}
          <Link href="https://docs.dolthub.com/sql-reference/version-control/dolt-sql-procedures#dolt_fetch">
            documentation
          </Link>
          .
        </p>
        <RemoteBranches
          params={params}
          remote={remote}
          currentBranch={currentBranch}
        />
      </ModalInner>
      <ModalButtons onRequestClose={onClose}>
        <Button onClick={onClose}>Close</Button>
      </ModalButtons>
    </ModalOuter>
  );
}
