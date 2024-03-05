import ButtonsWithError from "@components/ButtonsWithError";
import { Button, FormInput } from "@dolthub/react-components";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent } from "react";

type InnerProps = {
  onClose: () => void;
  databaseName: string;
  setDatabaseName: (d: string) => void;
  onSubmit: (e: SyntheticEvent) => void;
  err?: ApolloErrorType;
};

export default function InnerModal(props: InnerProps) {
  const { userHasWritePerms, writesEnabled } = useRole();

  if (!userHasWritePerms) {
    return (
      <div>
        <p>You must have write permissions to create a new database.</p>
        <Button onClick={props.onClose}>OK</Button>
      </div>
    );
  }

  if (!writesEnabled) {
    return (
      <div>
        <p>You must enable writes to create a new database.</p>
        <Button onClick={props.onClose}>OK</Button>
      </div>
    );
  }

  return (
    <form onSubmit={props.onSubmit}>
      <FormInput
        value={props.databaseName}
        label="Database name"
        onChangeString={props.setDatabaseName}
        placeholder="Choose a name for your database"
      />
      <ButtonsWithError error={props.err} onCancel={props.onClose}>
        <Button type="submit" disabled={!props.databaseName.length}>
          Create
        </Button>
      </ButtonsWithError>
    </form>
  );
}
