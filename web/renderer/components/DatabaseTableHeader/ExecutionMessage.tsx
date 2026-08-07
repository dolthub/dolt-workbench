import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn } from "@dolthub/react-components";
import { IoMdClose } from "react-icons/io";
import css from "./index.module.css";

export default function ExecutionMessage() {
  const { executionMessage, setExecutionMessage } = useSqlEditorContext();
  if (!executionMessage) return null;
  return (
    <div className={css.executionMessage}>
      <span>{executionMessage}</span>
      <Btn
        onClick={() => setExecutionMessage(undefined)}
        aria-label="Dismiss"
        className={css.executionMessageClose}
      >
        <IoMdClose />
      </Btn>
    </div>
  );
}
