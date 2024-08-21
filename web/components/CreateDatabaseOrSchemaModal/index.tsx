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

type InnerProps = {
  onClose: () => void;
  name: string;
  setName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
  label: "schema" | "database";
};

export default function CreateDatabaseOrSchemaModal(props: InnerProps) {
  const { userHasWritePerms, writesEnabled } = useRole();
  if (!userHasWritePerms) {
    return (
      <div>
        <ModalInner>
          <p>You must have write permissions to create a new {props.label}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose} />
      </div>
    );
  }
  if (!writesEnabled) {
    return (
      <div>
        <ModalInner>
          <p>You must enable writes to create a new {props.label}.</p>
        </ModalInner>
        <ModalButtons onRequestClose={props.onClose} />
      </div>
    );
  }
  return (
    <form onSubmit={props.onSubmit}>
      <ModalInner>
        <FormInput
          value={props.name}
          label={`${initialUppercase(props.label)} name`}
          onChangeString={props.setName}
          placeholder={`Choose a name for your ${props.label}`}
          light
        />
      </ModalInner>
      <ModalButtons err={props.err} onRequestClose={props.onClose}>
        <Button type="submit" disabled={!props.name.length}>
          Create
        </Button>
      </ModalButtons>
    </form>
  );
}
