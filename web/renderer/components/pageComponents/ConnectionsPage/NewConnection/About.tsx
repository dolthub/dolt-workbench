import {
  Button,
  ButtonsWithError,
  Checkbox,
  FormInput,
  FormSelect,
  Tooltip,
  useTabsContext,
} from "@dolthub/react-components";
import { useEffect, useState } from "react";
import { DatabaseConnectionFragment, DatabaseType } from "@gen/graphql-types";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import { ConfigState } from "./context/state";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function About() {
  const {
    state,
    setState,
    onSubmit,
    error: connectErr,
    storedConnections,
  } = useConfigContext();
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
        true,
      );
      console.log(result); // "Server started successfully"
      await onSubmit(e); // Now connect to the server
    } catch (error) {
      setErr(Error(`Failed to start Dolt server:, ${error}`));
      console.error("Failed to start Dolt server:", error);
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
          description="Run a Dolt SQL server hosted directly within Workbench. The app supports only one internal server instance, this restriction does not apply to external Dolt server connections."
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
          <>
            <Button
              type="submit"
              disabled={
                getStartLocalDoltServerDisabled(state, storedConnections)
                  .disabled
              }
              className={css.button}
              onClick={handleSubmit}
              data-tooltip-content={
                getStartLocalDoltServerDisabled(state, storedConnections)
                  .message
              }
              data-tooltip-id="add-local-dolt-server"
            >
              Start and Connect to Dolt Server
            </Button>
            <Tooltip
              id="add-local-dolt-server"
              className={css.tooltip}
              place="bottom"
            />
          </>
        ) : (
          <Button type="submit" disabled={!state.name} className={css.button}>
            Next
          </Button>
        )}
      </ButtonsWithError>
    </form>
  );
}

type DisabledReturnType = {
  disabled: boolean;
  message?: string;
};

function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
): DisabledReturnType {
  const disabled =
    !state.name ||
    !state.port ||
    !!connections?.some(connection => connection.isLocalDolt);

  if (!state.name) {
    return { disabled, message: "Connection name is required." };
  }
  if (!state.port) {
    return { disabled, message: "Port is required." };
  }
  if (connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled,
      message:
        "Already have one internal dolt server instance, remove it before adding a new one.",
    };
  }
  return { disabled };
}
