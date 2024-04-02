import { ModalButtons, ModalInner } from "@components/Modal";
import { Button, FormInput } from "@dolthub/react-components";
import { initialUppercase } from "@dolthub/web-utils";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent } from "react";

type InnerProps = {
  onClose: () => void;
  databaseName: string;
  setDatabaseName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
  name: "schema" | "database";
};

export default function InnerModal(props: InnerProps) {
  const { userHasWritePerms, writesEnabled } = useRole();

  if (!userHasWritePerms) {
    return (
      <div>
        <ModalInner>
          <p>You must have write permissions to create a new {props.name}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose}>
          <Button onClick={props.onClose}>OK</Button>
        </ModalButtons>
      </div>
    );
  }

  if (!writesEnabled) {
    return (
      <div>
        <ModalInner>
          <p>You must enable writes to create a new {props.name}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose}>
          <Button onClick={props.onClose}>OK</Button>
        </ModalButtons>
      </div>
    );
  }

  return (
    <form onSubmit={props.onSubmit}>
      <ModalInner>
        <FormInput
          value={props.databaseName}
          label={`${initialUppercase(props.name)} name`}
          onChangeString={props.setDatabaseName}
          placeholder={`Choose a name for your ${props.name}`}
          light
        />
      </ModalInner>
      <ModalButtons err={props.err} onRequestClose={props.onClose}>
        <Button type="submit" disabled={!props.databaseName.length}>
          Create
        </Button>
      </ModalButtons>
    </form>
  );
}
