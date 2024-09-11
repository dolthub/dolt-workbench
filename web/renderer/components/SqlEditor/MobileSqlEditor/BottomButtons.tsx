import { Button } from "@dolthub/react-components";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import css from "./index.module.css";

type Props = {
  setSubmitting: (value: React.SetStateAction<boolean>) => void;
  setOpenSqlEditor: (s: boolean) => void;
};

export default function BottomButtons(props: Props) {
  return (
    <div className={css.bottom}>
      <Button
        className={css.runQuery}
        onClick={() => props.setSubmitting(true)}
        data-cy="mobile-run-query-button"
      >
        <FaPlay className={css.icon} /> Run Query
      </Button>
      <Button
        className={css.cancel}
        onClick={() => {
          props.setSubmitting(false);
          props.setOpenSqlEditor(false);
        }}
        data-cy="mobile-close-query-editor-button"
      >
        Cancel
      </Button>
    </div>
  );
}
