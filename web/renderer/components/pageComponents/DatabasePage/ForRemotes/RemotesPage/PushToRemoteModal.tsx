import { RemoteFragment } from "@gen/graphql-types";
import {
  Button,
  FormInput,
  Loader,
  ModalButtons,
  ModalInner,
  ModalOuter,
  SuccessMsg,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import Link from "@components/links/Link";
import usePushToRemote from "./usePushToRemote";
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
  const { onClose, onSubmit, state, setState } = usePushToRemote(
    params,
    remote,
    undefined,
    setIsOpen,
  );
  return (
    <ModalOuter isOpen={isOpen} onRequestClose={onClose} title="Push to remote">
      <form onSubmit={onSubmit}>
        <ModalInner>
          <p>
            Update remote <span className={css.bold}>{remote.name}</span> (
            {remote.url}) with changes from the specified branch. To learn more
            about pushing to remotes, see our{" "}
            <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-push">
              documentation
            </Link>
          </p>
          <FormInput
            value={state.branchName}
            label="Branch name"
            onChangeString={(s: string) => {
              setState({ branchName: s, message: "", err: undefined });
            }}
            placeholder="Enter branch name to push to remote"
            light
          />
        </ModalInner>
        <ModalButtons err={state.err} onRequestClose={onClose}>
          {state.message ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <Button type="submit" disabled={!state.branchName.length}>
              Push
            </Button>
          )}
        </ModalButtons>
        <PushMessage message={state.message} />
      </form>
      <Loader loaded={!state.loading} />
    </ModalOuter>
  );
}

type PushMessageProps = {
  message: string;
};

function PushMessage({ message }: PushMessageProps) {
  if (message.includes("Everything up-to-date")) {
    return <p className={css.message}>{message}</p>;
  }
  if (message) {
    return (
      <div className={css.message}>
        <SuccessMsg>Push successful</SuccessMsg>
        <p>{message}</p>
      </div>
    );
  }
  return <div />;
}
