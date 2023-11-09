import cx from "classnames";
import { numToStringWithCommas } from "@lib/numToStringConversions";
import css from "./index.module.css";

type Props = {
  value?: number;
  count?: number;
  statSingle: string;
  statPlural: string;
  red?: boolean;
  green?: boolean;
  small?: boolean;
  err?: Error;
};

export default function SummaryStat({
  value,
  count,
  statSingle,
  statPlural,
  err,
  red = false,
  green = false,
  small = false,
}: Props) {
  if (err || value === undefined) {
    return <div className={cx(css.num, css.red)}>-</div>;
  }

  const stat = value === 1 ? statSingle : statPlural;
  const percent = count ? (value / count) * 100 : 0;

  return (
    <div className={cx(css.stat, { [css.smallStat]: small })}>
      <span className={cx(css.num, { [css.green]: green, [css.red]: red })}>
        {numToStringWithCommas(Math.abs(value))}
      </span>{" "}
      {stat}{" "}
      {count !== undefined && (
        <span className={css.percent}>{`${percent.toFixed(2)}%`}</span>
      )}
    </div>
  );
}
