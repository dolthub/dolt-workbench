import {
  Button,
  FormInput,
  ModalButtons,
  ModalInner,
  Radio,
} from "@dolthub/react-components";
import { initialUppercase } from "@dolthub/web-utils";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent, useState } from "react";
import CloneDatabaseForm from "@components/CloneDatabaseForm";
import css from "@components/CloneDatabaseForm/index.module.css";

type InnerProps = {
  onClose: () => void;
  name: string;
  setName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
  label: "schema" | "database";
  isDolt?: boolean;
};

export default function CreateDatabaseOrSchemaModal(props: InnerProps) {
  const { userHasWritePerms, writesEnabled } = useRole();
  const [cloneDolt, setCloneDolt] = useState(false);

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
        {props.isDolt && (
          <>
            <Radio
              checked={!cloneDolt}
              onChange={() => {
                setCloneDolt(false);
              }}
              name="create-database"
              label="Create a new database"
              className={css.checkbox}
            />
            <Radio
              checked={cloneDolt}
              onChange={() => {
                setCloneDolt(true);
              }}
              name="clone-dolt-server"
              label="Clone a remote Dolt database from DoltHub"
              className={css.checkbox}
            />
            {cloneDolt && <CloneDatabaseForm />}
          </>
        )}
        {!cloneDolt && (
          <FormInput
            value={props.name}
            label={`${initialUppercase(props.label)} name`}
            onChangeString={props.setName}
            placeholder={`Choose a name for your ${props.label}`}
            data-cy="database-name-input"
            light
          />
        )}
      </ModalInner>
      <ModalButtons err={props.err} onRequestClose={props.onClose}>
        {!cloneDolt && (
          <Button
            type="submit"
            disabled={!props.name.length}
            data-cy="create-database-modal-button"
          >
            Create
          </Button>
        )}
      </ModalButtons>
    </form>
  );
}
