import {
  Button,
  Checkbox,
  ErrorMsg,
  FormInput,
  Radio,
  SmallLoader,
  Tooltip,
} from "@dolthub/react-components";
import { ReactNode, SyntheticEvent, useState } from "react";
import { useConfigContext } from "./context/config";
import { getCanSubmit, getSqliteConnectionUrl } from "./context/utils";
import css from "./index.module.css";

enum SetupOption {
  Existing,
  Create,
}

const options = [
  [
    SetupOption.Existing,
    "Choose an existing database",
    "open-existing-database",
  ],
  [
    SetupOption.Create,
    "Create a new DoltLite database",
    "create-doltlite-database",
  ],
] as const;

export default function DoltLiteSetup({
  typeSelect,
}: {
  typeSelect: ReactNode;
}) {
  const context = useConfigContext();
  const { state, setState, error, setErr } = context;
  const [option, setOption] = useState(SetupOption.Existing);
  const [directory, setDirectory] = useState("");
  const isExisting = option === SetupOption.Existing;
  const destination = window.ipc?.getDoltLiteDatabaseDestination(
    directory,
    state.database,
  );

  const setDestination = (dir: string, database: string) => {
    const next = window.ipc?.getDoltLiteDatabaseDestination(dir, database);
    setState({
      database,
      name: next?.filePath ?? "",
      connectionUrl: next ? getSqliteConnectionUrl(next.filePath) : "",
    });
  };

  const selectOption = (next: SetupOption) => {
    setOption(next);
    setDirectory("");
    setErr(undefined);
    setState({
      name: "",
      database: "",
      connectionUrl: "",
      ...(next === SetupOption.Existing ? {} : { hideDoltFeatures: false }),
    });
  };

  const choose = async (
    channel: string,
    onSelected: (path: string) => void,
  ) => {
    try {
      const selected = (await window.ipc.invoke(channel)) as string | undefined;
      if (!selected) return;
      onSelected(selected);
      setErr(undefined);
    } catch (err) {
      setErr(err instanceof Error ? err : Error(String(err)));
    }
  };

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (isExisting) return context.onSubmit(e);
    try {
      await window.ipc.invoke("create-doltlite-database-file", state.name);
      await context.onSubmit(e);
    } catch (err) {
      setErr(err instanceof Error ? err : Error(String(err)));
    }
  };

  const { canSubmit, message } = getCanSubmit(state);
  const showSummary = directory && destination;
  const textField = (
    value: string,
    setValue: (value: string) => void,
    label: string,
    placeholder: string,
    dataCy: string,
  ) => (
    <FormInput
      value={value}
      onChangeString={next => {
        setValue(next);
        setErr(undefined);
      }}
      label={label}
      labelClassName={css.label}
      placeholder={placeholder}
      light
      data-cy={dataCy}
    />
  );

  return (
    <form
      onSubmit={submit}
      className={css.form}
      data-cy="connection-tab-form"
      data-testid="connection-tab-form"
    >
      {typeSelect}
      <div
        className={css.connectionOptions}
        data-cy="sqlite-connection-options"
      >
        {options.map(([value, label, name]) => (
          <Radio
            key={name}
            checked={option === value}
            onChange={() => selectOption(value)}
            name={name}
            label={label}
            className={css.radio}
          />
        ))}

        {isExisting ? (
          <div className={css.sqliteSettings}>
            <FilePicker
              value={state.name}
              label="Database File"
              placeholder="Choose an existing .db file"
              buttonLabel="Choose File"
              onClick={async () =>
                choose("select-sqlite-database-file", filePath =>
                  setState({
                    name: filePath,
                    connectionUrl: getSqliteConnectionUrl(filePath),
                  }),
                )
              }
              dataCy="sqlite-database-file"
            />
          </div>
        ) : (
          <div className={css.sqliteDestinationSettings}>
            <FilePicker
              value={directory}
              label="Database File Location"
              placeholder="Choose a folder"
              buttonLabel="Choose Folder"
              onClick={async () =>
                choose("select-sqlite-database-directory", selected => {
                  setDirectory(selected);
                  setDestination(selected, state.database);
                })
              }
              dataCy="sqlite-database-directory"
            />
            {textField(
              state.database,
              database => setDestination(directory, database),
              "Database Name",
              "my-database",
              "sqlite-database-name",
            )}
            {showSummary && (
              <p className={css.createSqliteSummary}>
                This will create <strong>{destination.fileName}</strong> in{" "}
                <strong>{directory}</strong>.
              </p>
            )}
          </div>
        )}

        <div
          className={
            isExisting ? css.sqliteAdvancedSettings : css.sqliteLaunchSettings
          }
        >
          {isExisting && (
            <Checkbox
              checked={state.hideDoltFeatures}
              onChange={() =>
                setState({ hideDoltFeatures: !state.hideDoltFeatures })
              }
              name="hide-dolt-features"
              label="Hide Dolt features"
              description="Hides Dolt features like branches, logs, and commits for non-Dolt databases. Will otherwise be disabled."
              className={css.checkbox}
            />
          )}
          <Button
            type="submit"
            disabled={!canSubmit || state.loading}
            className={css.button}
            data-tooltip-id="submit-message"
            data-tooltip-content={message}
            data-tooltip-hidden={canSubmit}
            data-cy="launch-workbench-button"
          >
            Launch Workbench
          </Button>
          {state.loading && <SmallLoader loaded={!state.loading} />}
          <ErrorMsg err={error} />
          <Tooltip id="submit-message" />
        </div>
      </div>
    </form>
  );
}

function FilePicker(props: {
  value: string;
  label: string;
  placeholder: string;
  buttonLabel: string;
  onClick: () => Promise<void>;
  dataCy: string;
}) {
  return (
    <div className={css.fileSelector}>
      <FormInput
        value={props.value}
        label={props.label}
        labelClassName={css.label}
        placeholder={props.placeholder}
        className={css.filePathInput}
        readOnly
        light
        data-cy={props.dataCy}
      />
      <Button
        type="button"
        className={css.fileSelectorButton}
        onClick={props.onClick}
      >
        {props.buttonLabel}
      </Button>
    </div>
  );
}
