import { Button, Checkbox, ErrorMsg } from "@dolthub/react-components";
import css from "./index.module.css";
import { useConfigContext } from "./context/config";
import { getCanSubmit } from "./context/utils";

export default function Advanced() {
  const { state, setState, error, onSubmit } = useConfigContext();

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
        disabled={!getCanSubmit(state)}
        className={css.button}
      >
        Launch Workbench
      </Button>
      <ErrorMsg err={error} />
    </form>
  );
}
