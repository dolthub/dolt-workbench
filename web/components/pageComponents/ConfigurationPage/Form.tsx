import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import CustomCheckbox from "@components/CustomCheckbox";
import FormInput from "@components/FormInput";
import Loader from "@components/Loader";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import css from "./index.module.css";
import useConfig from "./useConfig";

type Props = {
  hasDatabaseEnv: boolean;
  setShowForm: (s: boolean) => void;
};

export default function Form(props: Props) {
  const { onSubmit, state, setState, error, clearState } = useConfig();

  const onCancel = props.hasDatabaseEnv
    ? () => {
        props.setShowForm(false);
      }
    : clearState;

  return (
    <div className={css.databaseForm}>
      <Loader loaded={!state.loading} />
      <div className={css.databaseConfig}>
        <form
          onSubmit={async e =>
            onSubmit(
              e,
              `mysql://${state.username}:${state.password}@${state.host}:${state.port}/${state.database}`,
            )
          }
        >
          <h3>Set up new connection</h3>
          <FormInput
            label="Host"
            value={state.host}
            onChangeString={h => setState({ host: h })}
            placeholder="127.0.0.1"
            horizontal
          />
          <FormInput
            label="Port"
            value={state.port}
            onChangeString={p => setState({ port: p })}
            placeholder="3306"
            horizontal
          />
          <FormInput
            label="Username"
            value={state.username}
            onChangeString={u => setState({ username: u })}
            placeholder="root"
            horizontal
          />
          <FormInput
            label="Password"
            value={state.password}
            onChangeString={p => setState({ password: p })}
            placeholder="**********"
            type="password"
            horizontal
          />
          <FormInput
            label="Database"
            value={state.database}
            onChangeString={d => setState({ database: d })}
            placeholder="mydb"
            horizontal
          />
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
            cancelText={props.hasDatabaseEnv ? "cancel" : "clear"}
          >
            <Button type="submit" disabled={!state.host || !state.username}>
              Launch Workbench
            </Button>
          </ButtonsWithError>
        </form>
      </div>
    </div>
  );
}
