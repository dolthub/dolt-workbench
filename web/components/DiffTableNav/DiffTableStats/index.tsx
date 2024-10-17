import { useDiffContext } from "@contexts/diff";
import { DiffSummaryFragment } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { getPostgresTableName } from "@lib/postgres";
import cx from "classnames";
import ListItem from "./ListItem";
import css from "./index.module.css";

type Props = {
  className?: string;
};

export default function DiffTableStats(props: Props) {
  const { diffSummaries, params, activeTableName, refName } = useDiffContext();
  const { isPostgres } = useDatabaseDetails();
  return (
    <ul className={cx(css.list, props.className)}>
      {diffSummaries.map(ds => (
        <ListItem
          key={ds._id}
          diffSummary={ds}
          params={{ ...params, refName }}
          isActive={tableIsActive(ds, activeTableName, isPostgres)}
        />
      ))}
    </ul>
  );
}

function tableIsActive(
  ds: DiffSummaryFragment,
  activeTableName: string,
  isPostgres = false,
): boolean {
  if (isPostgres) {
    const active = getPostgresTableName(activeTableName);
    return (
      getPostgresTableName(ds.fromTableName) === active ||
      getPostgresTableName(ds.toTableName) === active
    );
  }
  return (
    ds.fromTableName === activeTableName || ds.toTableName === activeTableName
  );
}
