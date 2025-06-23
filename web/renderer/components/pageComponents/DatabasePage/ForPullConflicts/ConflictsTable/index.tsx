import { ErrorMsg } from "@dolthub/react-components";
import { RowConflictFragment } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import cx from "classnames";
import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import { RowConflictState } from "../state";
import css from "./index.module.css";

type Props = {
  fetchMore: () => Promise<void>;
  state: RowConflictState;
  hasMore: boolean;
  error?: ApolloErrorType;
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
    <div className={css.container}>
      <ErrorMsg err={props.error} />
      {props.state.rowConflicts.length ? (
        <InfiniteScroll
          hasMore={props.hasMore}
          loadMore={props.fetchMore}
          initialLoad={false}
          loader={<div key={0}>Loading rows ...</div>}
          useWindow={false}
          getScrollParent={() => document.getElementById("main-content")}
          className={css.infiniteScrollContainer}
        >
          <table className={css.table}>
            <thead>
              <tr>
                <th />
                {props.state.cols.map(c => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.state.rowConflicts.map((r, rowIndex) => (
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
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      ) : (
        <p className={css.noChanges}>No conflicts for this table</p>
      )}
    </div>
  );
}
