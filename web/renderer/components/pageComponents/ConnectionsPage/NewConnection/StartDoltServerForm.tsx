import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
} from "@dolthub/react-components";
import { connections as connectionsUrl } from "@lib/urls";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import Link from "@components/links/Link";
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

  const { disabled, message } = getStartLocalDoltServerDisabled(
    state,
    storedConnections,
  );
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
                disabled={disabled}
                className={css.button}
                onClick={onStartDoltServer}
              >
                Start and Connect to Dolt Server
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
