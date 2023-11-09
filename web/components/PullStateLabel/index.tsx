import { PullState } from "@gen/graphql-types";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  state?: PullState;
  className?: string;
};

export default function PullStateLabel({ state, className }: Props) {
  if (!state) return null;
  return (
    <span
      className={cx(css.state, css[state], className)}
      data-cy="pull-state-label"
    >
      {state}
    </span>
  );
}
