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
  Clone,
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
  [
    SetupOption.Clone,
    "Clone a remote DoltLite database from DoltHub",
    "clone-doltlite-database",
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
  const [owner, setOwner] = useState("");
  const [remoteDatabase, setRemoteDatabase] = useState("");
  const [destination, setDestinationDetails] = useState<{
    fileName: string;
    filePath: string;
  }>();
  const isExisting = option === SetupOption.Existing;
  const isClone = option === SetupOption.Clone;

  const setDestination = async (dir: string, database: string) => {
    setDestinationDetails(undefined);
    setState({
      database,
      name: "",
      connectionUrl: "",
    });

    try {
      const next = (await window.ipc.invoke(
        "get-doltlite-database-destination",
        dir,
        database,
      )) as { fileName: string; filePath: string } | undefined;

      setDestinationDetails(next);
      setState({
        name: next?.filePath ?? "",
        connectionUrl: next ? getSqliteConnectionUrl(next.filePath) : "",
      });
    } catch (err) {
      setErr(err instanceof Error ? err : Error(String(err)));
    }
  };

  const selectOption = (next: SetupOption) => {
    setOption(next);
    setDirectory("");
    setOwner("");
    setRemoteDatabase("");
    setDestinationDetails(undefined);
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
    if (isClone) {
      return context.onCloneDoltLiteDatabase(
        e,
        owner,
        remoteDatabase,
        state.database,
      );
    }
    try {
      await window.ipc.invoke("create-doltlite-database-file", state.name);
      await context.onSubmit(e);
    } catch (err) {
      setErr(err instanceof Error ? err : Error(String(err)));
    }
  };

  const { canSubmit, message } = getCanSubmit(state);
  const enabled =
    canSubmit && (!isClone || (!!owner.trim() && !!remoteDatabase.trim()));
  const submitMessage =
    message ||
    (isClone && !remoteDatabase.trim()
      ? "Remote database name is required"
      : isClone && !owner.trim()
        ? "Owner name is required"
        : undefined);
  const showSummary =
    directory &&
    destination &&
    (!isClone || (owner.trim() && remoteDatabase.trim()));
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
                  void setDestination(selected, state.database);
                })
              }
              dataCy={
                isClone
                  ? "sqlite-clone-database-directory"
                  : "sqlite-database-directory"
              }
            />
            {isClone && (
              <>
                {textField(
                  owner,
                  setOwner,
                  "Owner Name",
                  "e.g. dolthub (required)",
                  "sqlite-clone-owner-name",
                )}
                {textField(
                  remoteDatabase,
                  database => {
                    setRemoteDatabase(database);
                    void setDestination(directory, database);
                  },
                  "Remote Database Name",
                  "e.g. my-database (required)",
                  "sqlite-clone-remote-database-name",
                )}
              </>
            )}
            {textField(
              state.database,
              database => void setDestination(directory, database),
              isClone ? "New Database Name" : "Database Name",
              isClone ? "e.g. my-database (required)" : "my-database",
              isClone
                ? "sqlite-clone-new-database-name"
                : "sqlite-database-name",
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
            disabled={!enabled || state.loading}
            className={css.button}
            data-tooltip-id="submit-message"
            data-tooltip-content={submitMessage}
            data-tooltip-hidden={enabled}
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
