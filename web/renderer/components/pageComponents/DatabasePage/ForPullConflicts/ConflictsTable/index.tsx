import { RowConflictFragment } from "@gen/graphql-types";
import cx from "classnames";
import React from "react";
import css from "./index.module.css";

type Props = {
  rows: RowConflictFragment[];
  columns: string[];
  tableName: string;
};

export default function ConflictsTable(props: Props) {
  const isConflicted = (
    rowConflict: RowConflictFragment,
    columnIndex: number,
  ): boolean => {
    const oursValue = rowConflict.ours?.columnValues[columnIndex]?.displayValue;
    const theirsValue =
      rowConflict.theirs?.columnValues[columnIndex]?.displayValue;
    return oursValue !== theirsValue;
  };

  return (
    <table className={css.table}>
      <thead>
        <tr>
          <th />
          {props.columns.map(c => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((r, rowIndex) => {
          return (
            <React.Fragment key={rowIndex}>
              <tr>
                <td>base</td>
                {r.base?.columnValues.map((cv, colIndex) => (
                  <td key={colIndex}>{cv.displayValue}</td>
                ))}
              </tr>
              <tr className={css.oursRow}>
                <td>ours</td>
                {r.ours?.columnValues.map((cv, colIndex) => (
                  <td
                    key={colIndex}
                    className={cx({
                      [css.oursConflictedCell]: isConflicted(r, colIndex),
                    })}
                  >
                    {cv.displayValue}
                  </td>
                ))}
              </tr>
              <tr className={css.theirsRow}>
                <td>theirs</td>
                {r.theirs?.columnValues.map((cv, colIndex) => (
                  <td
                    key={colIndex}
                    className={cx({
                      [css.theirsConflictedCell]: isConflicted(r, colIndex),
                    })}
                  >
                    {cv.displayValue}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
