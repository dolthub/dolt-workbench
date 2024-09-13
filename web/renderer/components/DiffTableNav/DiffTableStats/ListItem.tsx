import { DiffSummaryFragment } from "@gen/graphql-types";
import { RequiredRefsParams } from "@lib/params";
import cx from "classnames";
import StatIcon from "./StatIcon";
import TableName from "./TableName";
import TableStat from "./TableStat";
import css from "./index.module.css";

type Props = {
  diffSummary: DiffSummaryFragment;
  params: RequiredRefsParams & { refName: string };
  isActive: boolean;
};

export default function ListItem(props: Props) {
  return (
    <li
      className={css.tableInfo}
      data-cy={`diff-table-stats-${props.diffSummary.tableName}`}
    >
      <span className={css.name}>
        <span
          className={cx(css.icon, css[`icon${props.diffSummary.tableType}`])}
        >
          <StatIcon tableType={props.diffSummary.tableType} />
        </span>
        <TableName {...props} />
      </span>
      <TableStat {...props} params={props.params} />
    </li>
  );
}
