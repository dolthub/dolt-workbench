import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
  SmallLoader,
  Checkbox,
} from "@dolthub/react-components";
import { connections as connectionsUrl } from "@lib/urls";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import Link from "@components/links/Link";
import { useState } from "react";
import { ConfigState } from "./context/state";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";

export default function StartDoltServerForm() {
  const {
    state,
    setState,
    error,
    setErr,
    storedConnections,
    onStartDoltServer,
  } = useConfigContext();
  const [cloneDolt, setCloneDolt] = useState(false);

  const { disabled, message } = getStartLocalDoltServerDisabled(
    state,
    storedConnections,
  );

  return (
    <>
      <Checkbox
        checked={cloneDolt}
        onChange={() => {
          setCloneDolt(!cloneDolt);
        }}
        name="clone-dolt-server"
        label="Clone a Dolt database"
        description="Clone a dolt database from DoltHub"
        className={css.checkbox}
      />
      {cloneDolt && (
        <FormInput
          value={state.name}
          onChangeString={n => {
            setState({ name: n });
            setErr(undefined);
          }}
          label="Owner Name"
          labelClassName={css.label}
          placeholder="e.g. dolthub"
          light
        />
      )}
      <FormInput
        value={state.name}
        onChangeString={n => {
          setState({ name: n });
          setErr(undefined);
        }}
        label="Database Name"
        labelClassName={css.label}
        placeholder="e.g. my-database (required)"
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
                onClick={onStartDoltServer}
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

type DisabledReturnType = {
  disabled: boolean;
  message?: React.ReactNode;
};

function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
): DisabledReturnType {
  const disabled =
    !state.name ||
    !state.port ||
    !!connections?.some(connection => connection.isLocalDolt) ||
    !!connections?.some(c => c.name === state.name);

  if (!disabled) {
    return { disabled };
  }
  if (!state.name) {
    return { disabled, message: <span>Connection name is required.</span> };
  }
  if (!state.port) {
    return { disabled, message: <span>Port is required.</span> };
  }
  if (connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled,
      message: (
        <div>
          <p>Already have one internal dolt server instance.</p>
          <p>
            Go to <Link {...connectionsUrl}>Connections</Link> and remove it
            before adding a new one.
          </p>
        </div>
      ),
    };
  }
  if (connections?.some(c => c.name === state.name)) {
    return {
      disabled,
      message: <span>Connection name already exists.</span>,
    };
  }
  return { disabled };
}
