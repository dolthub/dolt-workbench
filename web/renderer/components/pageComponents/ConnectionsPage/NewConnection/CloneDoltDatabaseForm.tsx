import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
  SmallLoader,
} from "@dolthub/react-components";
import { connections as connectionsUrl } from "@lib/urls";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import Link from "@components/links/Link";
import { ConfigState } from "./context/state";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import StartDoltServerForm from "./StartDoltServerForm";

export default function CloneDoltDatabaseForm() {
  const {
    state,
    setState,
    error,
    setErr,
    storedConnections,
    onCloneDoltHubDatabase,
  } = useConfigContext();

  const { disabled, message } = getStartLocalDoltServerDisabled(
    state,
    storedConnections,
  );

  return state.cloneFinished ? (
    <StartDoltServerForm />
  ) : (
    <>
      <FormInput
        value={state.owner}
        onChangeString={owner => {
          setState({ owner });
          setErr(undefined);
        }}
        label="Owner Name"
        labelClassName={css.label}
        placeholder="e.g. dolthub"
        light
      />
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
                onClick={onCloneDoltHubDatabase}
              >
                Start clone
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
    !state.owner ||
    !!connections?.some(connection => connection.isLocalDolt);

  if (!disabled) {
    return { disabled };
  }
  if (!state.name) {
    return { disabled, message: <span>Database name is required.</span> };
  }
  if (!state.owner) {
    return { disabled, message: <span>Owner name is required.</span> };
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

  return { disabled };
}
