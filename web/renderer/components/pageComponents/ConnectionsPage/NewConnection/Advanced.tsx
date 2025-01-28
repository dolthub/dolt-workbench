import {
  Button,
  Checkbox,
  ErrorMsg,
  SmallLoader,
  Tooltip,
} from "@dolthub/react-components";
import css from "./index.module.css";
import { useConfigContext } from "./context/config";
import { getCanSubmit } from "./context/utils";

export default function Advanced() {
  const { state, setState, error, onSubmit } = useConfigContext();
  const { canSubmit, message } = getCanSubmit(state);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.ipc.startDoltServer(state.name);
    onSubmit(e)
  };
  
  return (
    <form onSubmit={onSubmit} className={css.form}>
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
      >
        Launch Workbench
      </Button>
      <Button
        type="button"
        disabled={!canSubmit}
        className={css.button}
        data-tooltip-id="submit-message"
        data-tooltip-content={message}
        data-tooltip-hidden={canSubmit}
        onClick={handleSubmit}
      >
        Start and Connect to Dolt Server
      </Button>
      
      {state.loading && <SmallLoader loaded={!state.loading} />}
      <ErrorMsg err={error} />
      <Tooltip id="submit-message" />
    </form>
  );
}
