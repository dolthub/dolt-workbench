import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import HeadCell from "./HeadCell";
import { HiddenColIndexes, SetHiddenColIndexes, isHiddenColumn } from "./utils";

type Props = {
  cols: ColumnForDataTableFragment[];
  hiddenColIndexes: HiddenColIndexes;
  setHiddenColIndexes: SetHiddenColIndexes;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  hideCellButtons?: boolean;
  refName: string;
};

export default function Head(props: Props) {
  return (
    <thead>
      <tr data-cy="db-data-table-columns">
        <th />
        {props.cols.map((c, i) => {
          if (isHiddenColumn(i, props.hiddenColIndexes)) return null;
          return <HeadCell {...props} key={c.name} index={i} col={c} />;
        })}
      </tr>
    </thead>
  );
}
