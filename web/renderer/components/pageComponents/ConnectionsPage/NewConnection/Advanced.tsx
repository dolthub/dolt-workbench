import {
  Button,
  Checkbox,
  ErrorMsg,
  SmallLoader,
  Tooltip,
} from "@dolthub/react-components";
import { useEffect, useState } from "react";
import css from "./index.module.css";
import { useConfigContext } from "./context/config";
import { getCanSubmit } from "./context/utils";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function Advanced() {
  const { state, setState, error, onSubmit } = useConfigContext();
  const { canSubmit, message } = getCanSubmit(state);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.ipc.startDoltServer(state.name);
    await onSubmit(e);
  };
  useEffect(() => {
    if (forElectron) {
      const handleError = (event: any, msg: string) => {
        setErrorMessage(msg);
      };

      window.ipc.sendDoltServerError("server-error", handleError);
    }
  }, []);

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
      {forElectron && (
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
      )}

      {state.loading && <SmallLoader loaded={!state.loading} />}
      <ErrorMsg errString={error?.message || errorMessage} />
      <Tooltip id="submit-message" />
    </form>
  );
}
