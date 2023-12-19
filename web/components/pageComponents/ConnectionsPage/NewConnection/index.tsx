import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import CustomCheckbox from "@components/CustomCheckbox";
import FormInput from "@components/FormInput";
import FormSelect from "@components/FormSelect";
import Loader from "@components/Loader";
import ExternalLink from "@components/links/ExternalLink";
import { DatabaseType } from "@gen/graphql-types";
import { dockerHubRepo } from "@lib/constants";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import cx from "classnames";
import { useEffect, useState } from "react";
import css from "./index.module.css";
import useConfig from "./useConfig";

type Props = {
  canGoBack: boolean;
  setShowForm: (s: boolean) => void;
};

export default function NewConnection(props: Props) {
  const { onSubmit, state, setState, error, clearState } = useConfig();
  const canSubmit =
    state.name && (state.connectionUrl || (state.host && state.username));
  const [isDocker, setIsDocker] = useState(false);

  useEffect(() => {
    setIsDocker(window.location.origin === "http://localhost:3000");
  }, []);

  const onCancel = props.canGoBack
    ? () => {
        props.setShowForm(false);
      }
    : clearState;

  return (
    <div className={css.databaseForm}>
      <Loader loaded={!state.loading} />
      <div className={css.whiteContainer}>
        <form onSubmit={onSubmit}>
          <div className={css.section}>
            <h3>Set up new connection</h3>
            <p className={css.instructions}>
              View instructions for connecting to local and Docker installed
              databases <ExternalLink href={dockerHubRepo}>here</ExternalLink>.
            </p>
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
              label="Type"
              val={state.type}
              onChangeValue={t =>
                setState({
                  type: t,
                  port: t === DatabaseType.Mysql ? "3306" : "5432",
                })
              }
              options={[
                { label: "MySQL/Dolt", value: DatabaseType.Mysql },
                { label: "PostreSQL", value: DatabaseType.Postgres },
              ]}
              horizontal
              light
            />
          </div>
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
              placeholder={isDocker ? "host.docker.internal" : "127.0.0.1"}
              horizontal
              light
            />
            <FormInput
              label="Port"
              value={state.port}
              onChangeString={p => setState({ port: p })}
              placeholder={state.type === DatabaseType.Mysql ? "3306" : "5432"}
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
          </div>
          <div className={css.section}>
            <Button.Link
              onClick={() =>
                setState({ showAdvancedSettings: !state.showAdvancedSettings })
              }
              className={css.advancedSettings}
            >
              {state.showAdvancedSettings ? <FaCaretUp /> : <FaCaretDown />}{" "}
              Advanced settings
            </Button.Link>
            {state.showAdvancedSettings && (
              <div>
                <CustomCheckbox
                  checked={state.useSSL}
                  onChange={() => setState({ useSSL: !state.useSSL })}
                  name="use-ssl"
                  label="Use SSL"
                  description="If server does not allow insecure connections, client must use SSL/TLS."
                  className={css.checkbox}
                />
                <CustomCheckbox
                  checked={state.hideDoltFeatures}
                  onChange={() =>
                    setState({ hideDoltFeatures: !state.hideDoltFeatures })
                  }
                  name="hide-dolt-features"
                  label="Hide Dolt features"
                  description="Hides Dolt features like branches, logs, and commits for non-Dolt MySQL databases. Will otherwise be disabled."
                  className={css.checkbox}
                />
              </div>
            )}
            <ButtonsWithError
              error={error}
              onCancel={onCancel}
              cancelText={props.canGoBack ? "cancel" : "clear"}
            >
              <Button type="submit" disabled={!canSubmit}>
                Launch Workbench
              </Button>
            </ButtonsWithError>
          </div>
        </form>
      </div>
    </div>
  );
}
