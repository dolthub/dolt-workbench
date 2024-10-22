import {
  getTableColsFromQueryCols,
  isKeyless,
  queryShowingPKs,
} from "@components/CellButtons/utils";
import { useDataTableContext } from "@contexts/dataTable";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus } from "@lib/tableTypes";
import Row from "./Row";

type Props = {
  rows: RowForDataTableFragment[];
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
};

export default function Body(props: Props) {
  const { columns } = useDataTableContext();
  const showRowDropdown =
    !isKeyless(columns) && queryShowingPKs(props.columns, columns);
  const cols = getTableColsFromQueryCols(props.columns, columns);

  return (
    <tbody
      data-cy={`${
        props.isMobile ? "mobile-" : "desktop-"
      }db-data-table-table-body`}
    >
      {props.rows.map((r, ridx) => (
        // eslint-disable-next-line react/jsx-key
        <Row
          {...props}
          columns={cols}
          row={r}
          ridx={ridx}
          showRowDropdown={showRowDropdown}
        />
      ))}
    </tbody>
  );
}
