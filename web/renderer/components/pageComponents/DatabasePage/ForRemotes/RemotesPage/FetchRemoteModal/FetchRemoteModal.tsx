import { RemoteFragment } from "@gen/graphql-types";
import {
  Button,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import useDefaultBranch from "@hooks/useDefaultBranch";
import Link from "@components/links/Link";
import RemoteBranches from "./RemoteBranches";
import css from "./index.module.css";

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
  const onClose = () => {
    setIsOpen(false);
  };
  const { defaultBranchName } = useDefaultBranch(params);
  const currentBranch = params.refName || defaultBranchName;

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Fetch from remote"
      className={css.fetchModal}
    >
      <ModalInner>
        <p>
          Sync remote <span className={css.bold}>{remote.name}</span> (
          {remote.url}) branches with local branch{" "}
          <span className={css.bold}>{params.refName}</span>. To learn more
          about fetch remotes, see our{" "}
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
