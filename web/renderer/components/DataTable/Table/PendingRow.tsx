import DeleteRowButton from "@components/CellButtons/DeleteRowButton";
import { CellDropdown } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus } from "@lib/tableTypes";
import { useState } from "react";
import css from "./index.module.css";
import PendingCell from "./PendingCell";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
};

export default function PendingRow(props: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <tr className={css.row}>
      <td>
        <CellDropdown
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          buttonClassName={css.rowDropdown}
          forRow
        >
          <DeleteRowButton {...props} />
        </CellDropdown>
      </td>
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <PendingCell {...props} cell={c} cidx={cidx} />
      ))}
    </tr>
  );
}
