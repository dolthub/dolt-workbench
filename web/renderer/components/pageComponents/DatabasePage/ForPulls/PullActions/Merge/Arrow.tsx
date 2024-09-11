import cx from "classnames";
import css from "./index.module.css";

export function Arrow(props: { red?: boolean; green?: boolean }) {
  return (
    <div className={css.arrow}>
      <div
        className={cx(css.arrowLeft, css.arrowGrey, {
          [css.arrowRed]: props.red,
          [css.arrowGreen]: props.green,
        })}
      />
    </div>
  );
}
