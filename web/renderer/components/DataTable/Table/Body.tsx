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
import { useRouter } from "next/router";
import { useMemo } from "react";
import Row from "./Row";
import PendingRow from "./PendingRow";

type Props = {
  rows: RowForDataTableFragment[];
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
};

export default function Body(props: Props) {
  const { columns, pendingRow } = useDataTableContext();
  const { q } = useRouter().query;
  const showRowDropdown =
    !isKeyless(columns) && queryShowingPKs(props.columns, columns);
  const cols = useMemo(
    () => getTableColsFromQueryCols(props.columns, columns),
    [props.columns, columns],
  );

  return (
    <tbody
      data-cy={`${
        props.isMobile ? "mobile-" : "desktop-"
      }db-data-table-table-body`}
    >
      {pendingRow && <PendingRow {...props} columns={cols} row={pendingRow} />}
      {props.rows.map((r, ridx) => (
        <Row
          // Rows only append, so the index is a stable identity.
          // eslint-disable-next-line react/no-array-index-key
          key={ridx}
          columns={cols}
          row={r}
          ridx={ridx}
          q={q}
          isMobile={props.isMobile}
          columnStatus={props.columnStatus}
          showRowDropdown={showRowDropdown}
        />
      ))}
    </tbody>
  );
}
