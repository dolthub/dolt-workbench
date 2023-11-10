import { numToStringWithCommas } from "@lib/numToStringConversions";
import cx from "classnames";
import css from "./SummaryStat.module.css";

type Props = {
  value?: number;
  statSingle?: string;
  statPlural?: string;
  red?: boolean;
  green?: boolean;
  err?: Error;
  flat?: boolean;
  blue?: boolean;
  loading?: boolean;
};

export default function SummaryStat({
  value,
  statSingle,
  statPlural,
  err,
  red = false,
  green = false,
  flat = false,
  blue = false,
  loading = false,
}: Props) {
  if (loading && statPlural) {
    return (
      <div className={cx(css.stat, { [css.flat]: flat })}>{statPlural}</div>
    );
  }
  if (err || value === undefined) {
    return <div className={cx(css.num, css.red)}>-</div>;
  }

  const num = (
    <span
      className={cx(css.num, {
        [css.green]: green,
        [css.red]: red,
        [css.blue]: blue,
      })}
    >
      {getPlusOrMinus(green, red)}
      {numToStringWithCommas(Math.abs(value))}
    </span>
  );

  if (!statSingle || !statPlural) {
    return <div className={css.statNoText}>{num}</div>;
  }

  const stat = value === 1 ? statSingle : statPlural;
  return (
    <div className={cx(css.stat, { [css.flat]: flat })}>
      {num}
      {stat}
    </div>
  );
}

function getPlusOrMinus(green: boolean, red: boolean): string {
  if (green) return "+";
  if (red) return "-";
  return "";
}
