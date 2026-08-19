import {
  Button,
  ButtonsWithError,
  FormInput,
  FormSelect,
  Radio,
  useTabsContext,
} from "@dolthub/react-components";
import { DatabaseType } from "@gen/graphql-types";
import { SyntheticEvent, useState } from "react";
import CloneForm from "@components/CloneDatabaseForm/CloneForm";
import { useConfigContext } from "./context/config";
import { getStartLocalDoltServerDisabled } from "./context/utils";
import DoltLiteSetup from "./DoltLiteSetup";
import StartDoltServerForm from "./StartDoltServerForm";
import css from "./index.module.css";

enum ConnectionOption {
  Existing,
  New,
  Clone,
}

type ConnectionNameInputProps = {
  dataCy?: string;
};

type DoltConnectionOptionsProps = {
  option: ConnectionOption;
  select: (option: ConnectionOption) => void;
};

function getDefaultPort(type: DatabaseType): string {
  if (type === DatabaseType.Mysql) return "3306";
  if (type === DatabaseType.Postgres) return "5432";
  return "";
}

function getDefaultUsername(type: DatabaseType): string {
  if (type === DatabaseType.Mysql) return "root";
  if (type === DatabaseType.Postgres) return "postgres";
  return "";
}

export default function About() {
  const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";
  const {
    state,
    setState,
    error,
    setErr,
    storedConnections,
    onCloneDoltHubDatabase,
  } = useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();
  const [connectionOption, setConnectionOption] = useState(
    ConnectionOption.Existing,
  );
  const { disabled, message } = getStartLocalDoltServerDisabled(
    state,
    storedConnections,
  );

  const selectType = (type: DatabaseType) => {
    setErr(undefined);
    setConnectionOption(ConnectionOption.Existing);
    setState({
      type,
      name: "",
      database: "",
      connectionUrl: "",
      port: getDefaultPort(type),
      username: getDefaultUsername(type),
      useSSL: type !== DatabaseType.Sqlite,
      isLocalDolt: false,
      cloneDolt: false,
    });
  };

  const typeSelect = (
    <FormSelect
      outerClassName={css.typeSelect}
      className={css.typeSelectInner}
      labelClassName={css.label}
      label="Type"
      val={state.type}
      onChangeValue={type => type && selectType(type)}
      options={[
        { label: "MySQL/Dolt", value: DatabaseType.Mysql },
        { label: "Postgres/Doltgres", value: DatabaseType.Postgres },
        ...(forElectron
          ? [{ label: "SQLite/DoltLite", value: DatabaseType.Sqlite }]
          : []),
      ]}
      hideSelectedOptions
      light
      data-cy="connection-type-selector"
    />
  );

  if (state.type === DatabaseType.Sqlite) {
    return <DoltLiteSetup typeSelect={typeSelect} />;
  }

  const onNext = (e: SyntheticEvent) => {
    e.preventDefault();
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <form onSubmit={onNext} className={css.form} data-cy="connection-tab-form">
      {typeSelect}
      {forElectron && state.type === DatabaseType.Mysql && (
        <DoltConnectionOptions
          option={connectionOption}
          select={next => {
            setConnectionOption(next);
            setState(
              next === ConnectionOption.Existing
                ? { isLocalDolt: false, cloneDolt: false }
                : {
                    useSSL: false,
                    port: "3658",
                    isLocalDolt: true,
                    cloneDolt: next === ConnectionOption.Clone,
                  },
            );
          }}
        />
      )}
      {state.type === DatabaseType.Mysql &&
        connectionOption === ConnectionOption.New && (
          <StartDoltServerForm
            disabledForConnection={disabled}
            disabledForConnectionMessage={message}
          />
        )}
      {state.type === DatabaseType.Mysql &&
        connectionOption === ConnectionOption.Clone && (
          <>
            <ConnectionNameInput />
            <FormInput
              label="Port"
              value={state.port}
              onChangeString={port => {
                setState({ port });
                setErr(undefined);
              }}
              placeholder="e.g. 3658 (required)"
              light
              labelClassName={css.label}
            />
            <CloneForm
              onCloneDoltHubDatabase={onCloneDoltHubDatabase}
              setErr={setErr}
              error={error}
              progress={state.progress}
              loading={state.loading}
              disabledForConnection={disabled}
              disabledForConnectionMessage={message}
            />
          </>
        )}
      {connectionOption === ConnectionOption.Existing && (
        <>
          <ConnectionNameInput dataCy="connection-name-input" />
          <ButtonsWithError error={error}>
            <Button
              type="submit"
              disabled={!state.name}
              className={css.button}
              data-cy="next-about"
            >
              Next
            </Button>
          </ButtonsWithError>
        </>
      )}
    </form>
  );
}

function ConnectionNameInput({ dataCy }: ConnectionNameInputProps) {
  const { state, setState, setErr } = useConfigContext();
  return (
    <FormInput
      value={state.name}
      onChangeString={name => {
        setState({ name });
        setErr(undefined);
      }}
      label="Connection Name"
      labelClassName={css.label}
      placeholder={
        dataCy ? "my-connection (required)" : "e.g. my-connection (required)"
      }
      light
      data-cy={dataCy}
    />
  );
}

function DoltConnectionOptions({ option, select }: DoltConnectionOptionsProps) {
  return (
    <>
      <Radio
        checked={option === ConnectionOption.Existing}
        onChange={() => select(ConnectionOption.Existing)}
        name="existing-dolt-server"
        label="Connect to an existing Dolt server"
        className={css.radio}
      />
      <Radio
        checked={option === ConnectionOption.New}
        onChange={() => select(ConnectionOption.New)}
        name="start-dolt-server"
        label="Start a fresh Dolt server"
        description="Run a Dolt SQL server hosted directly within the Workbench. The app supports only one internal server instance, but this restriction does not apply to external Dolt server connections."
        className={css.radio}
      />
      <Radio
        checked={option === ConnectionOption.Clone}
        onChange={() => select(ConnectionOption.Clone)}
        name="clone-dolt-server"
        label="Clone a remote Dolt database from DoltHub"
        className={css.radio}
      />
    </>
  );
}
