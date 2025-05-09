import { Button, FormInput, useTabsContext } from "@dolthub/react-components";
import { DatabaseType } from "@gen/graphql-types";
import { SyntheticEvent } from "react";
import css from "./index.module.css";
import { useConfigContext } from "./context/config";

export default function Connection() {
  const { state, setState } = useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();

  const onNext = (e: SyntheticEvent) => {
    e.preventDefault();
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <form onSubmit={onNext} className={css.form} data-cy="connection-tab-form">
      <FormInput
        value={state.connectionUrl}
        onChangeString={c => setState({ connectionUrl: c })}
        label="URL"
        placeholder={`${
          state.type === DatabaseType.Mysql ? "mysql" : "postgresql"
        }://[user]:[password]@[host]/[database]`}
        horizontal
        light
        labelClassName={css.label}
        name="connection-url"
      />
      <div className={css.or}>OR</div>
      <FormInput
        label="Host"
        value={state.host}
        onChangeString={h => setState({ host: h })}
        placeholder={state.hostPlaceholder}
        horizontal
        light
        labelClassName={css.label}
      />
      <FormInput
        label="Port"
        value={state.port}
        onChangeString={p => setState({ port: p })}
        placeholder={state.type === DatabaseType.Mysql ? "3306" : "5432"}
        horizontal
        light
        labelClassName={css.label}
      />
      <FormInput
        label="User"
        value={state.username}
        onChangeString={u => setState({ username: u })}
        placeholder="root"
        horizontal
        light
        labelClassName={css.label}
      />
      <FormInput
        label="Password"
        value={state.password}
        onChangeString={p => setState({ password: p })}
        placeholder="**********"
        type="password"
        horizontal
        light
        labelClassName={css.label}
      />
      <FormInput
        label="Database"
        value={state.database}
        onChangeString={d => setState({ database: d })}
        placeholder="mydb"
        horizontal
        light
        labelClassName={css.label}
      />
      <Button
        type="submit"
        disabled={!state.connectionUrl && (!state.host || !state.port)}
        className={css.button}
        data-cy="connection-next-button"
      >
        Next
      </Button>
    </form>
  );
}
