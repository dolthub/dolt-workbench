import {
  Button,
  ButtonsWithError,
  Checkbox,
  FormInput,
  FormSelect,
  useTabsContext,
} from "@dolthub/react-components";
import { useEffect, useState } from "react";
import { DatabaseType } from "@gen/graphql-types";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function About() {
  const { state, setState, onSubmit, error: connectErr } = useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();
  const [err, setErr] = useState<Error | undefined>(undefined);
  const [startDoltServer, setStartDoltServer] = useState(false);

  const onNext = () => {
    setActiveTabIndex(activeTabIndex + 1);
  };

  useEffect(() => {
    if (forElectron) {
      window.ipc.getDoltServerError(async (msg: string) => {
        setErr(Error(msg));
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await window.ipc.invoke(
        "start-dolt-server",
        state.name,
        state.port,
      );
      console.log(result); // "Server started successfully"
      await onSubmit(e); // Now connect to the server
    } catch (error) {
      console.error("Failed to start Dolt server:", error);
      // Show an error message to the user
    }
  };
  return (
    <form onSubmit={onNext} className={css.form}>
      {forElectron && (
        <Checkbox
          checked={startDoltServer}
          onChange={() => {
            setState({
              useSSL: startDoltServer,
              port: startDoltServer ? "" : state.port,
              isLocalDolt: !startDoltServer,
            });
            setStartDoltServer(!startDoltServer);
          }}
          name="start-dolt-server"
          label="Start a dolt server"
          description="Run a Dolt SQL server hosted directly within Workbench. The app supports only one internal server instance - attempting to create another will return an error. This restriction does not apply to external Dolt server connections."
          className={css.checkbox}
        />
      )}
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
      {!startDoltServer && (
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
        />
      )}
      {startDoltServer && (
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
      )}
      <ButtonsWithError error={err || connectErr}>
        {startDoltServer ? (
          <Button
            type="submit"
            disabled={!state.name || state.type !== DatabaseType.Mysql}
            className={css.button}
            onClick={handleSubmit}
          >
            Start and Connect to Dolt Server
          </Button>
        ) : (
          <Button type="submit" disabled={!state.name} className={css.button}>
            Next
          </Button>
        )}
      </ButtonsWithError>
    </form>
  );
}
