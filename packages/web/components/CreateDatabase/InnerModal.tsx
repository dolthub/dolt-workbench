import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import FormInput from "@components/FormInput";
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
