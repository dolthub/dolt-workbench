import { Btn } from "@dolthub/react-components";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  showData: boolean;
  setShowData: (s: boolean) => void;
  hasSchemaChanges: boolean;
  hasDataChanges: boolean;
};

export default function TabButtons({
  showData,
  setShowData,
  hasSchemaChanges,
  hasDataChanges,
}: Props) {
  return (
    <div className={css.buttons}>
      <Btn
        onClick={() => setShowData(true)}
        className={cx({ [css.active]: showData })}
        disabled={!hasDataChanges}
        data-cy="data-button"
      >
        Data{!hasDataChanges ? " (0)" : ""}
      </Btn>
      <Btn
        onClick={() => setShowData(false)}
        className={cx({ [css.active]: !showData })}
        disabled={!hasSchemaChanges}
        data-cy="schema-button"
      >
        Schema{!hasSchemaChanges ? " (0)" : ""}
      </Btn>
    </div>
  );
}
