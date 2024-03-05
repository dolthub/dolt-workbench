import ButtonsWithError from "@components/ButtonsWithError";
import { Button, FormInput } from "@dolthub/react-components";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent } from "react";

type InnerProps = {
  onClose: () => void;
  schemaName: string;
  setSchemaName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
};

export default function InnerModal(props: InnerProps) {
  const { userHasWritePerms, writesEnabled } = useRole();

  if (!userHasWritePerms) {
    return (
      <div>
        <p>You must have write permissions to create a new schema.</p>
        <Button onClick={props.onClose}>OK</Button>
      </div>
    );
  }

  if (!writesEnabled) {
    return (
      <div>
        <p>You must enable writes to create a new schema.</p>
        <Button onClick={props.onClose}>OK</Button>
      </div>
    );
  }

  return (
    <form onSubmit={props.onSubmit}>
      <FormInput
        value={props.schemaName}
        label="Schema name"
        onChangeString={props.setSchemaName}
        placeholder="Choose a name for your schema"
      />
      <ButtonsWithError error={props.err} onCancel={props.onClose}>
        <Button type="submit" disabled={!props.schemaName.length}>
          Create
        </Button>
      </ButtonsWithError>
    </form>
  );
}
