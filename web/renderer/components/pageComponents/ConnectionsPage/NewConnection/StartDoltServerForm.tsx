import {
  Button,
  ButtonsWithError,
  FormInput,
  Tooltip,
} from "@dolthub/react-components";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
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
  return (
    <>
      <FormInput
        value={state.name}
        onChangeString={n => {
          setState({ name: n });
          setErr(undefined);
        }}
        label="Name"
        labelClassName={css.label}
        placeholder="my-database (required)"
        light
      />
      <FormInput
        label="Port"
        value={state.port}
        onChangeString={p => {
          setState({ port: p });
          setErr(undefined);
        }}
        placeholder="Enter port number"
        light
        labelClassName={css.label}
      />
      <ButtonsWithError error={error}>
        <Button
          type="submit"
          disabled={
            getStartLocalDoltServerDisabled(state, storedConnections).disabled
          }
          className={css.button}
          onClick={onStartDoltServer}
          data-tooltip-content={
            getStartLocalDoltServerDisabled(state, storedConnections).message
          }
          data-tooltip-id="add-local-dolt-server"
        >
          Start and Connect to Dolt Server
        </Button>
        <Tooltip
          id="add-local-dolt-server"
          className={css.tooltip}
          place="bottom"
        />
      </ButtonsWithError>
    </>
  );
}

type DisabledReturnType = {
  disabled: boolean;
  message?: string;
};

function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
): DisabledReturnType {
  const disabled =
    !state.name ||
    !state.port ||
    !!connections?.some(connection => connection.isLocalDolt);
  if (!disabled) {
    return { disabled };
  }
  if (!state.name) {
    return { disabled, message: "Connection name is required." };
  }
  if (!state.port) {
    return { disabled, message: "Port is required." };
  }
  if (connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled,
      message:
        "Already have one internal dolt server instance, remove it before adding a new one.",
    };
  }
  return { disabled };
}
