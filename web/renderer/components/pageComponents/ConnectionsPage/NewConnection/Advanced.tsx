import {
  Button,
  Checkbox,
  ErrorMsg,
  Radio,
  SmallLoader,
  Tooltip,
} from "@dolthub/react-components";
import css from "./index.module.css";
import { useConfigContext } from "./context/config";
import { getCanSubmit } from "./context/utils";
import { AuthType } from "./context/state";
import MutualTLSForm from "@pageComponents/ConnectionsPage/NewConnection/MutualTLSForm";

export default function Advanced() {
  const { state, setState, error, onSubmit } = useConfigContext();
  const { canSubmit, message } = getCanSubmit(state);

  const handleAuthTypeChange = (authType: AuthType) => {
    setState({
      authType,
      useSSL: authType === "ssl" || authType === "mtls",
    });
  };

  return (
    <form onSubmit={onSubmit} className={css.form} data-cy="advanced-tab-form">
      <h4>Authentication</h4>
      <Radio
        checked={state.authType === "ssl"}
        onChange={() => handleAuthTypeChange("ssl")}
        name="ssl-auth-type"
        label="Use SSL"
        description="If server does not allow insecure connections, client must use SSL/TLS."
        className={css.radio}
      />
      <Radio
        checked={state.authType === "mtls"}
        onChange={() => handleAuthTypeChange("mtls")}
        name="mtls-auth-type"
        label="Use mTLS"
        description="Mutual TLS authentication with client certificates"
        className={css.radio}
      />
      {state.authType === "mtls" && <MutualTLSForm />}
      <Radio
        checked={state.authType === "none"}
        onChange={() => handleAuthTypeChange("none")}
        name="none-auth-type"
        label="None"
        description="Connect without SSL/TLS encryption"
        className={css.radio}
      />

      <h4>General</h4>
      <Checkbox
        checked={state.hideDoltFeatures}
        onChange={() => setState({ hideDoltFeatures: !state.hideDoltFeatures })}
        name="hide-dolt-features"
        label="Hide Dolt features"
        description="Hides Dolt features like branches, logs, and commits for non-Dolt databases. Will otherwise be disabled."
        className={css.checkbox}
      />

      <Button
        type="submit"
        disabled={!canSubmit}
        className={css.button}
        data-tooltip-id="submit-message"
        data-tooltip-content={message}
        data-tooltip-hidden={canSubmit}
        data-cy="launch-workbench-button"
      >
        Launch Workbench
      </Button>

      {state.loading && <SmallLoader loaded={!state.loading} />}
      <ErrorMsg err={error} />
      <Tooltip id="submit-message" />
    </form>
  );
}
