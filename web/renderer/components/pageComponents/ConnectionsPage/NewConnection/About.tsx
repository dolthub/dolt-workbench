import {
  Button,
  ButtonsWithError,
  Checkbox,
  FormInput,
  FormSelect,
  useTabsContext,
} from "@dolthub/react-components";
import { useState } from "react";
import { DatabaseType } from "@gen/graphql-types";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import StartDoltServerForm from "./StartDoltServerForm";
import CloneDoltDatabaseForm from "./CloneDoltDatabaseForm";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function About() {
  const { state, setState, error, setErr } = useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();
  const [startDoltServer, setStartDoltServer] = useState(false);
  const [cloneDolt, setCloneDolt] = useState(false);

  const onNext = () => {
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <form onSubmit={onNext} className={css.form} data-cy="connection-tab-form">
      {forElectron && (
        <>
          <Checkbox
            checked={startDoltServer}
            onChange={e => {
              setState({
                useSSL: startDoltServer,
                port: e.target.checked ? "3658" : state.port,
                isLocalDolt: !startDoltServer,
              });
              setStartDoltServer(!startDoltServer);
            }}
            name="start-dolt-server"
            label="Start a fresh Dolt server"
            description="Run a Dolt SQL server hosted directly within the Workbench. The app supports only one internal server instance, but this restriction does not apply to external Dolt server connections."
            className={css.checkbox}
            disabled={cloneDolt}
          />
          <Checkbox
            checked={cloneDolt}
            onChange={e => {
              setState({
                useSSL: cloneDolt,
                port: e.target.checked ? "3658" : state.port,
                isLocalDolt: !cloneDolt,
                cloneDolt: !cloneDolt,
              });
              setCloneDolt(!cloneDolt);
            }}
            name="clone-dolt-server"
            label="Clone a remote Dolt database"
            description="Clone a Dolt database from DoltHub"
            className={css.checkbox}
            disabled={startDoltServer}
          />
        </>
      )}
      {startDoltServer && <StartDoltServerForm />}
      {cloneDolt && <CloneDoltDatabaseForm />}
      {!startDoltServer && !cloneDolt && (
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
            name="connection-name"
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
            <Button type="submit" disabled={!state.name} className={css.button} data-cy="about-next-button">
              Next
            </Button>
          </ButtonsWithError>
        </>
      )}
    </form>
  );
}
