import {
  Button,
  FormInput,
  ModalButtons,
  ModalInner,
} from "@dolthub/react-components";
import { initialUppercase } from "@dolthub/web-utils";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent } from "react";

type Props = {
  onClose: () => void;
  branchName: string;
  setBranchName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
  label: "pull from remote" | "push to remote";
};

export default function PullOrPushRemoteModal(props: Props) {
  const { userHasWritePerms, writesEnabled } = useRole();
  if (!userHasWritePerms) {
    return (
      <div>
        <ModalInner>
          <p>You must have write permissions to {props.label}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose} />
      </div>
    );
  }
  if (!writesEnabled) {
    return (
      <div>
        <ModalInner>
          <p>You must enable writes to {props.label}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose} />
      </div>
    );
  }
  return (
    <form onSubmit={props.onSubmit}>
      <ModalInner>
        <FormInput
          value={props.branchName}
          label={`${initialUppercase(props.label)}`}
          onChangeString={props.setBranchName}
          placeholder="Enter remote branch name"
          light
        />
      </ModalInner>
      <ModalButtons err={props.err} onRequestClose={props.onClose}>
        <Button type="submit" disabled={!props.branchName.length}>
          Start
        </Button>
      </ModalButtons>
    </form>
  );
}
