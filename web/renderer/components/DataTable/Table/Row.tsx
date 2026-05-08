import CopyRowButton from "@components/CellButtons/CopyRowButton";
import DeleteRowButton from "@components/CellButtons/DeleteRowButton";
import HideRowButton from "@components/CellButtons/HideRowButton";
import { CellDropdown } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus } from "@lib/tableTypes";
import { useState } from "react";
import Cell from "./Cell";
import css from "./index.module.css";
import { getDiffTypeClassNameForRow } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  ridx: number;
  columns: ColumnForDataTableFragment[];
  showRowDropdown: boolean;
  isMobile?: boolean;
  columnStatus: ColumnStatus;
  workingDiffType?: string | undefined;
};

export default function Row(props: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (props.row.columnValues.length !== props.columns.length) {
    return null;
  }

  const diffTypeClassName = getDiffTypeClassNameForRow(
    props.row,
    props.columns,
  );

  return (
    <tr className={diffTypeClassName}>
      <td>
        {props.showRowDropdown && (
          <CellDropdown
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            buttonClassName={css.rowDropdown}
            forRow
          >
            <HideRowButton {...props} />
            <DeleteRowButton
              {...props}
              onClose={() => setShowDropdown(false)}
            />
            <CopyRowButton {...props} />
          </CellDropdown>
        )}
      </td>
      {props.row.columnValues.map((cell, cidx) => (
        <Cell key={cidx} {...props} cell={cell} cidx={cidx} />
      ))}
    </tr>
  );
}
