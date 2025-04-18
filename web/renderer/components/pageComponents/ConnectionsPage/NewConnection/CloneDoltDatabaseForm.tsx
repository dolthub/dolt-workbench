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

type Props = {
  init?: boolean;
};

export default function CloneDoltDatabaseForm({ init }: Props) {
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
    init,
  );

  return (
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
        value={state.database}
        onChangeString={n => {
          setState({ database: n });
          setErr(undefined);
        }}
        label="Remote Database Name"
        labelClassName={css.label}
        placeholder="e.g. my-database (required)"
        light
      />
      {init && (
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
        </>
      )}
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
              {state.loading ? (
                <div className={css.cloneProgress}>
                  <span>Cloning...</span>
                  <div className={css.progressContainer}>
                    <div
                      className={css.progressBar}
                      style={{ transform: `scaleX(${state.progress / 100})` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={disabled || state.loading}
                  className={css.button}
                  onClick={async e => onCloneDoltHubDatabase(e, init)}
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

type DisabledReturnType = {
  disabled: boolean;
  message?: React.ReactNode;
};

function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
  init?: boolean,
): DisabledReturnType {
  if (!state.database) {
    return { disabled: true, message: <span>Database name is required.</span> };
  }
  if (!state.owner) {
    return { disabled: true, message: <span>Owner name is required.</span> };
  }

  if (init && connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled: true,
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

  return { disabled: false };
}
