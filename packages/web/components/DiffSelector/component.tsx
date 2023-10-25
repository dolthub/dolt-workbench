import { CommitForDiffSelectorFragment } from "@gen/graphql-types";
import excerpt from "@lib/excerpt";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function DiffSelector({ className, children }: Props) {
  return (
    <div className={cx(className, css.selector)} data-cy="diff-selector">
      {children}
    </div>
  );
}

export function formatCommitShort(c: CommitForDiffSelectorFragment) {
  return `${excerpt(c.message, 32)} (${c.commitId.substring(0, 6)})`;
}
