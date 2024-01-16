import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForDiffTableListFragment,
  DiffRowType,
  RowDiffForTableListFragment,
  RowDiffListWithColsFragment,
} from "@gen/graphql-types";
import { Dispatch } from "react";

export const defaultState = {
  offset: undefined as Maybe<number>,
  rowDiffs: [] as RowDiffForTableListFragment[],
  cols: [] as ColumnForDiffTableListFragment[],
  filter: undefined as DiffRowType | undefined,
};

export type RowDiffState = typeof defaultState;

export type RowDiffDispatch = Dispatch<Partial<RowDiffState>>;

export function getDefaultState(
  rowDiffList?: RowDiffListWithColsFragment,
): RowDiffState {
  return {
    ...defaultState,
    rowDiffs: rowDiffList?.list ?? [],
    cols: rowDiffList?.columns ?? [],
    offset: rowDiffList?.nextOffset,
  };
}
