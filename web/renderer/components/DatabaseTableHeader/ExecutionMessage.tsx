import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn } from "@dolthub/react-components";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import css from "./index.module.css";

export default function ExecutionMessage() {
  const {
    executionMessage,
    setExecutionMessage,
    executionError,
    setExecutionError,
  } = useSqlEditorContext();
  const isError = !!executionError;
  const message = executionError ?? executionMessage;
  if (!message) return null;
  const onDismiss = () =>
    isError ? setExecutionError(undefined) : setExecutionMessage(undefined);
  return (
    <div
      className={cx(css.executionMessage, { [css.executionError]: isError })}
      data-cy={isError ? "execution-error-message" : "execution-message"}
      role={isError ? "alert" : "status"}
    >
      <span>{message}</span>
      <Btn
        onClick={onDismiss}
        aria-label="Dismiss"
        className={cx(css.executionMessageClose, {
          [css.executionErrorClose]: isError,
        })}
      >
        <IoMdClose />
      </Btn>
    </div>
  );
}
