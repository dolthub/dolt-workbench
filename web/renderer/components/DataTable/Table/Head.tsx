import { useDataTableContext } from "@contexts/dataTable";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import { getTableColsFromQueryCols } from "@components/CellButtons/utils";
import HeadCell from "./HeadCell";

type Props = {
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
};

export default function Head(props: Props) {
  const { columns } = useDataTableContext();
  const cols = getTableColsFromQueryCols(props.columns, columns);
  return (
    <thead>
      <tr
        data-cy={`${
          props.isMobile ? "mobile-" : "desktop-"
        }db-data-table-columns`}
      >
        <th />
        {cols.map((c, i) => (
          <HeadCell {...props} key={c.name} col={c} idx={i} />
        ))}
      </tr>
    </thead>
  );
}
