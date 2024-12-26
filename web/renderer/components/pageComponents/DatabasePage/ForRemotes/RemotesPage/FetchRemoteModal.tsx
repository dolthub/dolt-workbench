import { RemoteFragment } from "@gen/graphql-types";
import {
  Button,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
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
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Fetch from remote"
      className={css.fetchModal}
    >
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
      <ModalButtons onRequestClose={onClose}>
        <Button onClick={onClose}>Close</Button>
      </ModalButtons>
    </ModalOuter>
  );
}
