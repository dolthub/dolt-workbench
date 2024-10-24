/* eslint-disable react/jsx-key */
import DeleteRowButton from "@components/CellButtons/DeleteRowButton";
import { CellDropdown } from "@dolthub/react-components";
import {
  ColumnForDiffTableListFragment,
  RowDiffForTableListFragment,
} from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import { useState } from "react";
import Cell, { CellType } from "./Cell";
import css from "./index.module.css";
import { HiddenColIndexes, isHiddenColumn } from "./utils";

type Props = {
  rowDiff: RowDiffForTableListFragment;
  ridx: number;
  hiddenColIndexes: HiddenColIndexes;
  cols: ColumnForDiffTableListFragment[];
  hideCellButtons?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  userCanWrite: boolean;
  refName: string;
};

export default function Row(props: Props) {
  const { added, deleted } = props.rowDiff;
  const deletedRowClassName = cx({
    [css.rowDeleted]: !added,
    [css.noBorder]: !!added,
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const deletedRow = !!deleted && (
    <tr className={cx(css.deletedRow, deletedRowClassName)} key="deleted">
      <td className={css.minus}>&minus;</td>
      {deleted.columnValues.map((c, i) => {
        if (isHiddenColumn(i, props.hiddenColIndexes)) return null;
        return (
          // this will render false columnValues unless wrapped with fragment
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            <Cell
              {...props}
              key={c.displayValue}
              type={CellType.Deleted}
              thisVal={c}
              otherVal={(added?.columnValues ?? [])[i]}
              cidx={i}
              row={props.rowDiff}
            />
          </>
        );
      })}
    </tr>
  );

  const addedRowClassName = cx({ [css.rowAdded]: !deleted });
  const addedRow = !!added && props.rowDiff.added && (
    <tr className={cx(css.addedRow, addedRowClassName)} key="added">
      <td
        className={cx(css.added, {
          [css.clicked]: showDropdown,
        })}
      >
        <span className={css.firstCell}>
          {!props.hideCellButtons && props.userCanWrite && (
            <CellDropdown
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              buttonClassName={css.rowDropdownButton}
              dropdownClassName={css.rowDropdown}
              forRow
            >
              <DeleteRowButton
                row={props.rowDiff.added}
                columns={props.cols}
                refName={props.refName}
              />
            </CellDropdown>
          )}
          +
        </span>
      </td>
      {added.columnValues.map((c, i) => {
        if (isHiddenColumn(i, props.hiddenColIndexes)) return null;
        return (
          // this will render false columnValues unless wrapped with fragment
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            <Cell
              {...props}
              key={c.displayValue}
              type={CellType.Added}
              thisVal={c}
              otherVal={(deleted?.columnValues ?? [])[i]}
              cidx={i}
              row={props.rowDiff}
            />
          </>
        );
      })}
    </tr>
  );

  return (
    <>
      {deletedRow}
      {addedRow}
    </>
  );
}
