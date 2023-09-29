import cx from "classnames";
import { ITooltip, Tooltip as ReactTooltip } from "react-tooltip";
import css from "./index.module.css";

export default function Tooltip(props: ITooltip) {
  return (
    <ReactTooltip {...props} className={cx(css.tooltip, props.className)} />
  );
}
