import {
  Button,
  ButtonsWithError,
  Checkbox,
  ExternalLink,
  FormInput,
  FormSelect,
  Loader,
} from "@dolthub/react-components";
import { DatabaseType } from "@gen/graphql-types";
import { dockerHubRepo } from "@lib/constants";
import MainLayout from "@components/layouts/MainLayout";
import cx from "classnames";
import useConfig, { getCanSubmit } from "./useConfig";
import WelcomeMessage from "./WelcomeMessage";
import css from "./index.module.css";

export default function NewConnection() {
  const { onSubmit, state, setState, error } = useConfig();

  return (
    <MainLayout className={css.container}>
      <div className={css.databaseForm}>
        <Loader loaded={!state.loading} />
        <WelcomeMessage />
        <div className={css.whiteContainer}>
          <form onSubmit={onSubmit}>
            <div className={css.top}>
              <h3>Set up new connection</h3>
              <p className={css.instructions}>
                View instructions for connecting to local and Docker installed
                databases <ExternalLink href={dockerHubRepo}>here</ExternalLink>
                .
              </p>
            </div>
            {state.showAbout && (
              <div className={css.section}>
                <FormInput
                  value={state.name}
                  onChangeString={n => setState({ name: n })}
                  label="Name"
                  placeholder="my-database (required)"
                  horizontal
                  light
                />
                <FormSelect
                  outerClassName={css.typeSelect}
                  className={css.typeSelectInner}
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
                  horizontal
                  light
                />
                <Button
                  onClick={() =>
                    setState({
                      showConnectionDetails: true,
                      showAbout: false,
                      showAdvancedSettings: false,
                    })
                  }
                  disabled={!state.name}
                >
                  Next
                </Button>
              </div>
            )}
            {state.showConnectionDetails && (
              <div className={cx(css.section, css.middle)}>
                <FormInput
                  value={state.connectionUrl}
                  onChangeString={c => setState({ connectionUrl: c })}
                  label="URL"
                  placeholder={`${
                    state.type === DatabaseType.Mysql ? "mysql" : "postgresql"
                  }://[user]:[password]@[host]/[database]`}
                  horizontal
                  light
                />
                <div className={css.or}>OR</div>
                <FormInput
                  label="Host"
                  value={state.host}
                  onChangeString={h => setState({ host: h })}
                  placeholder={state.hostPlaceholder}
                  horizontal
                  light
                />
                <FormInput
                  label="Port"
                  value={state.port}
                  onChangeString={p => setState({ port: p })}
                  placeholder={
                    state.type === DatabaseType.Mysql ? "3306" : "5432"
                  }
                  horizontal
                  light
                />
                <FormInput
                  label="User"
                  value={state.username}
                  onChangeString={u => setState({ username: u })}
                  placeholder="root"
                  horizontal
                  light
                />
                <FormInput
                  label="Password"
                  value={state.password}
                  onChangeString={p => setState({ password: p })}
                  placeholder="**********"
                  type="password"
                  horizontal
                  light
                />
                <FormInput
                  label="Database"
                  value={state.database}
                  onChangeString={d => setState({ database: d })}
                  placeholder="mydb"
                  horizontal
                  light
                />
                <Button
                  onClick={() =>
                    setState({
                      showConnectionDetails: false,
                      showAbout: false,
                      showAdvancedSettings: true,
                    })
                  }
                  disabled={
                    !state.connectionUrl || (!state.host && !state.port)
                  }
                >
                  Next
                </Button>
              </div>
            )}
            {state.showAdvancedSettings && (
              <div className={css.section}>
                <div>
                  <Checkbox
                    checked={state.useSSL}
                    onChange={() => setState({ useSSL: !state.useSSL })}
                    name="use-ssl"
                    label="Use SSL"
                    description="If server does not allow insecure connections, client must use SSL/TLS."
                    className={css.checkbox}
                  />
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
                </div>
                <ButtonsWithError error={error}>
                  <Button type="submit" disabled={!getCanSubmit(state)}>
                    Launch Workbench
                  </Button>
                </ButtonsWithError>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
