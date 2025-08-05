import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
} from "@dolthub/react-components";
import { ReactNode, SyntheticEvent, useState } from "react";
import { SetApolloErrorType } from "@lib/errors/types";
import css from "./index.module.css";
import { DisabledReturnType } from "@pageComponents/ConnectionsPage/NewConnection/context/utils";

type Props = {
  onCloneDoltHubDatabase: (
    e: SyntheticEvent,
    owner: string,
    remoteDbName: string,
    newDbName: string,
  ) => Promise<void>;
  progress: number;
  loading: boolean;
  error?: Error | undefined;
  setErr: SetApolloErrorType;
  disabledForConnection: boolean;
  disabledForConnectionMessage?: ReactNode;
};

export default function CloneForm({
  onCloneDoltHubDatabase,
  progress,
  loading,
  error,
  setErr,
  disabledForConnection,
  disabledForConnectionMessage,
}: Props) {
  const [owner, setOwner] = useState("");
  const [remoteDbName, setRemoteDbName] = useState("");
  const [newDbName, setNewDbName] = useState("");
  const { disabled, message } = getDisabled(
    disabledForConnection,
    owner,
    remoteDbName,
    newDbName,
    disabledForConnectionMessage,
  );

  return (
    <>
      <FormInput
        value={owner}
        onChangeString={val => {
          setOwner(val);
          setErr(undefined);
        }}
        label="Owner Name"
        labelClassName={css.label}
        placeholder="e.g. dolthub (required)"
        light
      />
      <FormInput
        value={remoteDbName}
        onChangeString={dbName => {
          setRemoteDbName(dbName);
          setNewDbName(dbName);
          setErr(undefined);
        }}
        label="Remote Database Name"
        labelClassName={css.label}
        placeholder="e.g. my-database (required)"
        light
      />
      <FormInput
        value={newDbName}
        onChangeString={dbName => {
          setNewDbName(dbName);
          setErr(undefined);
        }}
        label="New Database Name"
        labelClassName={css.label}
        placeholder="e.g. my-database (required)"
        light
      />
      <ButtonsWithError error={error} className={css.buttons}>
        <Popup
          position="bottom center"
          on={["hover"]}
          contentStyle={{
            fontSize: "0.875rem",
            width: "fit-content",
          }}
          closeOnDocumentClick
          trigger={
            <div>
              {loading ? (
                <div className={css.cloneProgress}>
                  <span>Cloning...</span>
                  <div className={css.progressContainer}>
                    <div
                      className={css.progressBar}
                      style={{ transform: `scaleX(${progress / 100})` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={disabled || loading}
                  className={css.button}
                  onClick={async e =>
                    onCloneDoltHubDatabase(e, owner, remoteDbName, newDbName)
                  }
                >
                  Start Clone
                </Button>
              )}
            </div>
          }
          disabled={!disabled}
        >
          {disabled && <div className={css.popup}>{message}</div>}
        </Popup>
      </ButtonsWithError>
    </>
  );
}

function getDisabled(
  disabledForConnection: boolean,
  owner: string,
  remoteDatabaseName: string,
  newDatabaseName: string,
  disabledForConnectionMessage?: ReactNode,
): DisabledReturnType {
  if (disabledForConnection) {
    return { disabled: true, message: disabledForConnectionMessage };
  }
  if (!remoteDatabaseName) {
    return {
      disabled: true,
      message: <span>Remote database name is required.</span>,
    };
  }

  if (!newDatabaseName) {
    return {
      disabled: true,
      message: <span>New database name is required.</span>,
    };
  }
  if (!owner) {
    return { disabled: true, message: <span>Owner name is required.</span> };
  }
  return { disabled: false };
}
