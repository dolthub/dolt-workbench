import { Tooltip } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import css from "./index.module.css";

type Props = {
  val?: Maybe<string>;
};

export default function DoltDisabledSelector(props: Props) {
  return (
    <>
      <div
        className={css.doltDisabled}
        data-tooltip-content="Use Dolt to enable branches"
        data-tooltip-id="selector-no-dolt"
        data-tooltip-place="top"
      >
        {props.val}
      </div>
      <Tooltip id="selector-no-dolt" />
    </>
  );
}
