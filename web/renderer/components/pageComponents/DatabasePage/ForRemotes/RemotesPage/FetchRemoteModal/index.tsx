import {
  Button,
  ErrorMsg,
  ModalButtons,
  ModalInner,
  ModalOuter,
  SuccessMsg,
} from "@dolthub/react-components";
import { RemoteFragment } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { OptionalRefParams } from "@lib/params";
import RemoteBranches from "./RemoteBranches";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (d: boolean) => void;
  remote: RemoteFragment;
  params: OptionalRefParams;
  err?: ApolloErrorType | undefined;
};

export default function FetchRemoteModal({
  isOpen,
  setIsOpen,
  remote,
  params,
  err,
}: Props) {
  const onClose = () => {
    setIsOpen(false);
  };
  ``;
  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={onClose}
      title={`Manage remote branches for ${remote.name}`}
      className={css.fetchModal}
    >
      <ModalInner>
        {err ? (
          <ErrorMsg err={err} />
        ) : (
          <SuccessMsg>Fetch completed successfully.</SuccessMsg>
        )}
        <p>
          Synchronize your local branches with the remote{" "}
          <span className={css.bold}>{remote.name}</span> ({remote.url})
          branches.
        </p>
        {!err && <RemoteBranches params={params} remote={remote} />}
      </ModalInner>
      <ModalButtons onRequestClose={onClose}>
        <Button onClick={onClose}>Close</Button>
      </ModalButtons>
    </ModalOuter>
  );
}
