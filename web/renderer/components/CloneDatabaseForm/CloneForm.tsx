import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
} from "@dolthub/react-components";
import { useConfigContext } from "@components/pageComponents/ConnectionsPage/NewConnection/context/config";
import css from "./index.module.css";
import { getStartLocalDoltServerDisabled } from "./utils";

type Props = {
  forInit?: boolean;
};

export default function CloneForm({ forInit }: Props) {
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
    forInit,
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
      {forInit && (
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
                  onClick={async e => onCloneDoltHubDatabase(e, forInit)}
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
