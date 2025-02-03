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
  const { state, setState, onSubmit } = useConfigContext();
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
    window.ipc.startDoltServer(state.name);
    await onSubmit(e);
  };

  return (
    <form onSubmit={onNext} className={css.form}>
      {forElectron && (
        <Checkbox
          checked={startDoltServer}
          onChange={() => {
            setState({ useSSL: startDoltServer });
            setStartDoltServer(!startDoltServer);
          }}
          name="start-dolt-server"
          label="Start a dolt server"
          description="Start a local dolt server and connect to it."
          className={css.checkbox}
        />
      )}
      <FormInput
        value={state.name}
        onChangeString={n => setState({ name: n })}
        label="Name"
        labelClassName={css.label}
        placeholder="my-database (required)"
        light
      />
      <FormSelect
        outerClassName={css.typeSelect}
        className={css.typeSelectInner}
        labelClassName={css.label}
        label="Type"
        val={state.type}
        onChangeValue={t => {
          if (!t) return;
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
      {startDoltServer && (
        <FormInput
          label="Port"
          value={state.port}
          onChangeString={p => setState({ port: p })}
          placeholder={state.type === DatabaseType.Mysql ? "3306" : "5432"}
          light
          labelClassName={css.label}
        />
      )}
      <ButtonsWithError error={err}>
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
