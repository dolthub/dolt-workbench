import CloneDoltDatabaseForm from "@components/pageComponents/ConnectionsPage/NewConnection/CloneDoltDatabaseForm";
import { useConfigContext } from "@components/pageComponents/ConnectionsPage/NewConnection/context/config";
import {
  Button,
  Checkbox,
  FormInput,
  ModalButtons,
  ModalInner,
  QueryHandler,
} from "@dolthub/react-components";
import { initialUppercase } from "@dolthub/web-utils";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import useRole from "@hooks/useRole";
import { ApolloErrorType } from "@lib/errors/types";
import { SyntheticEvent, useState } from "react";

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
  const [cloneDolt, setCloneDolt] = useState(false);
  const { state, setState } = useConfigContext();
  const res = useCurrentConnectionQuery();
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
      <QueryHandler
        result={res}
        render={data => (
          <Checkbox
            checked={cloneDolt}
            onChange={e => {
              setState({
                useSSL: cloneDolt,
                port: e.target.checked ? "3658" : state.port,
                isLocalDolt: !cloneDolt,
                cloneDolt: !cloneDolt,
                name: data.currentConnection?.name,
              });
              setCloneDolt(!cloneDolt);
            }}
            name="clone-dolt-server"
            label="Clone a remote Dolt database"
            description="Clone a Dolt database from DoltHub"
          />
        )}
      />
      <ModalInner>
        {cloneDolt ? (
          <CloneDoltDatabaseForm />
        ) : (
          <FormInput
            value={props.name}
            label={`${initialUppercase(props.label)} name`}
            onChangeString={props.setName}
            placeholder={`Choose a name for your ${props.label}`}
            light
          />
        )}
      </ModalInner>
      <ModalButtons err={props.err} onRequestClose={props.onClose}>
        {!cloneDolt && (
          <Button type="submit" disabled={!props.name.length}>
            Create
          </Button>
        )}
      </ModalButtons>
    </form>
  );
}
