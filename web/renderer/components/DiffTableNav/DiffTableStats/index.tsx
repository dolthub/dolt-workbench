import { useDiffContext } from "@contexts/diff";
import { DiffSummaryFragment } from "@gen/graphql-types";
import cx from "classnames";
import ListItem from "./ListItem";
import css from "./index.module.css";

type Props = {
  className?: string;
};

export default function DiffTableStats(props: Props) {
  const { diffSummaries, params, activeTableName, refName } = useDiffContext();
  return (
    <ul className={cx(css.list, props.className)}>
      {diffSummaries.map(ds => (
        <ListItem
          key={ds._id}
          diffSummary={ds}
          params={{ ...params, refName }}
          isActive={tableIsActive(ds, activeTableName)}
        />
      ))}
    </ul>
  );
}

function tableIsActive(
  ds: DiffSummaryFragment,
  activeTableName: string,
): boolean {
  return (
    ds.fromTableName === activeTableName || ds.toTableName === activeTableName
  );
}
