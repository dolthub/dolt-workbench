import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
  SmallLoader,
} from "@dolthub/react-components";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import { ReactNode, useState } from "react";

type Props = {
  disabledForConnection: boolean;
  disabledForConnectionMessage?: ReactNode;
};

export default function StartDoltServerForm({
  disabledForConnection,
  disabledForConnectionMessage,
}: Props) {
  const { state, setState, error, setErr, onStartDoltServer } =
    useConfigContext();

  const [databaseName, setDatabaseName] = useState("");
  const { disabled, message } = getDisabled(
    disabledForConnection,
    databaseName,
    disabledForConnectionMessage,
  );

  return (
    <>
      <FormInput
        value={state.name}
        onChangeString={n => {
          setState({ name: n });
          setErr(undefined);
        }}
        label="Connection Name"
        labelClassName={css.label}
        placeholder="e.g. my-connection (required)"
        light
      />
      <FormInput
        label="Port"
        value={state.port}
        onChangeString={p => {
          setState({ port: p });
          setErr(undefined);
        }}
        placeholder="e.g. 3658 (required)"
        light
        labelClassName={css.label}
      />
      <FormInput
        value={databaseName}
        onChangeString={db => {
          setDatabaseName(db);
        }}
        label="Database Name"
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
              <Button
                type="submit"
                disabled={disabled || state.loading}
                className={css.button}
                onClick={async e => onStartDoltServer(e, databaseName)}
              >
                Start and Connect to Dolt Server
                <SmallLoader
                  loaded={!state.loading}
                  options={{ top: "1.5rem", left: "49%" }}
                />
              </Button>
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
  databaseName: string,
  disabledForConnectionMessage?: ReactNode,
) {
  if (disabledForConnection) {
    return { disabled: true, message: disabledForConnectionMessage };
  }
  if (!databaseName) {
    return { disabled: true, message: <span>Database name is required.</span> };
  }
  return { disabled: false };
}
