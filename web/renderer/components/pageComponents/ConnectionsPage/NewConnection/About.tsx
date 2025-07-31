import {
  Button,
  ButtonsWithError,
  Radio,
  FormInput,
  FormSelect,
  useTabsContext,
} from "@dolthub/react-components";
import { SyntheticEvent, useState } from "react";
import { DatabaseType } from "@gen/graphql-types";
import CloneForm from "@components/CloneDatabaseForm/CloneForm";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import StartDoltServerForm from "./StartDoltServerForm";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

enum ConnectionOption {
  Existing,
  New,
  Clone
}

export default function About() {
  const { state, setState, error, setErr, onCloneDoltHubDatabase } =
    useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();
  const [connectionOption, setConnectionOption] = useState(ConnectionOption.Existing);

  const onNext = (e: SyntheticEvent) => {
    e.preventDefault();
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <form onSubmit={onNext} className={css.form} data-cy="connection-tab-form">
      {forElectron && (
        <>
          <Radio
            checked={connectionOption === ConnectionOption.Existing}
            onChange={() => {
              setConnectionOption(ConnectionOption.Existing);
              setState({
                isLocalDolt: false
              })
            }}
            name="existing-dolt-server"
            label="Connect to an existing Dolt server"
            className={css.checkbox}
          />
          <Radio
            checked={connectionOption === ConnectionOption.New}
            onChange={() => {
              setState({
                useSSL: false,
                port: "3658",
                isLocalDolt: true,
              });
              setConnectionOption(ConnectionOption.New);
            }}
            name="start-dolt-server"
            label="Start a fresh Dolt server"
            description="Run a Dolt SQL server hosted directly within the Workbench. The app supports only one internal server instance, but this restriction does not apply to external Dolt server connections."
            className={css.checkbox}
          />
          <Radio
            checked={connectionOption === ConnectionOption.Clone}
            onChange={() => {
              setState({
                useSSL: false,
                port: "3658",
                isLocalDolt: true,
                cloneDolt: true,
              });
              setConnectionOption(ConnectionOption.Clone);
            }}
            name="clone-dolt-server"
            label="Clone a remote Dolt database from DoltHub"
            className={css.checkbox}
          />
        </>
      )}
      {connectionOption === ConnectionOption.New && <StartDoltServerForm />}
      {connectionOption === ConnectionOption.Clone && (
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
          <CloneForm
            onCloneDoltHubDatabase={onCloneDoltHubDatabase}
            setErr={setErr}
            error={error}
            progress={state.progress}
            loading={state.loading}
          />
        </>
      )}
      {connectionOption === ConnectionOption.Existing && (
        <>
          <FormInput
            value={state.name}
            onChangeString={n => {
              setState({ name: n });
              setErr(undefined);
            }}
            label="Connection Name"
            labelClassName={css.label}
            placeholder="my-database (required)"
            light
            data-cy="connection-name-input"
          />
          <FormSelect
            outerClassName={css.typeSelect}
            className={css.typeSelectInner}
            labelClassName={css.label}
            label="Type"
            val={state.type}
            onChangeValue={t => {
              if (!t) return;
              setErr(undefined);
              setState({
                type: t,
                port: t === DatabaseType.Mysql ? "3306" : "5432",
                username: t === DatabaseType.Mysql ? "root" : "postgres",
              });
            }}
            options={[
              { label: "MySQL/Dolt", value: DatabaseType.Mysql },
              {
                label: "Postgres/Doltgres",
                value: DatabaseType.Postgres,
              },
            ]}
            hideSelectedOptions
            light
            data-cy="connection-type-selector"
          />
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
