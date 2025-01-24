import { Tooltip } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  val?: Maybe<string>;
  showLabel?: boolean;
};

export default function DoltDisabledSelector(props: Props) {
  return (
    <div className={css.disabledWrapper}>
      {props.showLabel && <span className={css.label}>Branch:</span>}
      <div
        className={cx(css.doltDisabled, css.branchAndTagSelect)}
        data-tooltip-content="Use Dolt to enable branches"
        data-tooltip-id="selector-no-dolt"
        data-tooltip-place="top"
      >
        {props.val}
      </div>
      <Tooltip id="selector-no-dolt" />
    </div>
  );
}
