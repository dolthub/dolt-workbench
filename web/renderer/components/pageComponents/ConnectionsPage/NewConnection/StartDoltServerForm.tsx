import {
  Button,
  ButtonsWithError,
  FormInput,
  Popup,
  SmallLoader,
} from "@dolthub/react-components";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";
import { ReactNode } from "react";

type Props = {
  disabled: boolean;
  message?: ReactNode;
};

export default function StartDoltServerForm({ disabled, message }: Props) {
  const { state, setState, error, setErr, onStartDoltServer } =
    useConfigContext();

  return (
    <>
      <FormInput
        value={state.name}
        onChangeString={n => {
          setState({ name: n });
          setErr(undefined);
        }}
        label="Database Name"
        labelClassName={css.label}
        placeholder="e.g. my-database (required)"
        light
      />
      <FormInput
        label="Port"
        value={state.port}
        onChangeString={p => {
          setState({ port: p });
          setErr(undefined);
        }}
        placeholder="e.g. 3658 (required)"
        light
        labelClassName={css.label}
      />
      <ButtonsWithError error={error} className={css.buttons}>
        <Popup
          position="bottom center"
          on={["hover"]}
          contentStyle={{
            fontSize: "0.875rem",
            width: "fit-content",
          }}
          closeOnDocumentClick
          trigger={
            <div>
              <Button
                type="submit"
                disabled={disabled || state.loading}
                className={css.button}
                onClick={onStartDoltServer}
              >
                Start and Connect to Dolt Server
                <SmallLoader
                  loaded={!state.loading}
                  options={{ top: "1.5rem", left: "49%" }}
                />
              </Button>
            </div>
          }
          disabled={!disabled}
        >
          {disabled && <div className={css.popup}>{message}</div>}
        </Popup>
      </ButtonsWithError>
    </>
  );
}
