import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import { useState } from "react";
import DeleteRowButton from "@components/CellButtons/DeleteRowButton";
import HideRowButton from "@components/CellButtons/HideRowButton";
import CellDropdown from "@components/CellDropdown";
import Cell from "./Cell";
import css from "./index.module.css";
import { getDiffTypeClassnameForRow } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  ridx: number;
  columns: ColumnForDataTableFragment[];
  showRowDropdown: boolean;
  isMobile?: boolean;
  columnStatus: ColumnStatus;
};

export default function Row(props: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const diffTypeClassname = getDiffTypeClassnameForRow(
    props.row,
    props.columns,
  );

  return (
    <tr className={cx(css.row, diffTypeClassname)}>
      <td>
        {props.showRowDropdown && (
          <CellDropdown
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            buttonClassName={css.rowDropdown}
            forRow
            isMobile={props.isMobile}
          >
            <HideRowButton {...props} />
            <DeleteRowButton {...props} />
          </CellDropdown>
        )}
      </td>
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <Cell {...props} cell={c} cidx={cidx} />
      ))}
    </tr>
  );
}
