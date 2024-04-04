import { Btn, Tooltip } from "@dolthub/react-components";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import css from "./index.module.css";

type Props = {
  setSubmitting: (s: boolean) => void;
};

export default function RightButtons(props: Props) {
  const id = "query-button";
  return (
    <div className={css.sidebar}>
      <Btn
        className={css.button}
        onClick={() => props.setSubmitting(true)}
        data-cy="run-query-button"
        data-tooltip-id={id}
        data-tooltip-content="run query"
        data-tooltip-place="left"
      >
        <FaPlay className={css.icon} />
      </Btn>
      <Tooltip id={id} variant="light" />
    </div>
  );
}
