import { Maybe } from "@dolthub/web-utils";
import {
  RowConflictFragment,
  RowConflictListFragment,
} from "@gen/graphql-types";
import { Dispatch } from "react";

export const defaultState = {
  offset: undefined as Maybe<number>,
  rowConflicts: [] as RowConflictFragment[],
  cols: [] as string[],
};

export type RowConflictState = typeof defaultState;

export type RowConflictDispatch = Dispatch<Partial<RowConflictState>>;

export function getDefaultState(
  res?: RowConflictListFragment,
): RowConflictState {
  return {
    ...defaultState,
    rowConflicts: res?.list ?? [],
    cols: res?.columns ?? [],
    offset: res?.nextOffset,
  };
}
