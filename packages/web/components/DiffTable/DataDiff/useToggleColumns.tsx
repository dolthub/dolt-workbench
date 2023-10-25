import {
  ColumnForDiffTableListFragment,
  RowDiffForTableListFragment,
} from "@gen/graphql-types";
import { useCallback, useEffect, useState } from "react";
import {
  HiddenColIndexes,
  SetHiddenColIndexes,
  getUnchangedColIndexes,
} from "./utils";

type ReturnType = {
  removeCol: (idx: number) => void;
  onClickHideUnchangedCol: () => void;
  hideUnchangedCols: boolean;
};

export default function useToggleColumns(
  cols: ColumnForDiffTableListFragment[],
  rowDiffs: RowDiffForTableListFragment[],
  hiddenColIndexes: HiddenColIndexes,
  setHiddenColIndexes: SetHiddenColIndexes,
): ReturnType {
  const [hideUnchangedCols, setHideUnchangedCols] = useState(false);
  const [currentUnchangedCols, setCurrentUnchangedCols] = useState(
    [] as HiddenColIndexes,
  );

  const removeCol = (idx: number) => {
    const unchangedCols = new Set(currentUnchangedCols);
    unchangedCols.delete(idx);
    setCurrentUnchangedCols([...unchangedCols]);
  };

  const toggleHideUnchangedCols = useCallback(
    (toggle?: boolean) => {
      const unchangedCols = getUnchangedColIndexes(cols, rowDiffs);
      const shouldAddHiddenCols = toggle
        ? !hideUnchangedCols
        : hideUnchangedCols;

      if (shouldAddHiddenCols) {
        setHiddenColIndexes([...unchangedCols]);
        setCurrentUnchangedCols([...unchangedCols]);
      } else {
        if (toggle) {
          setHiddenColIndexes([]);
        }

        setCurrentUnchangedCols([]);
      }
    },
    [hideUnchangedCols, hiddenColIndexes, setHiddenColIndexes, rowDiffs, cols],
  );

  useEffect(() => {
    if (currentUnchangedCols.length !== 0) {
      return;
    }
    setHideUnchangedCols(false);
  }, [currentUnchangedCols]);

  useEffect(() => {
    toggleHideUnchangedCols();
  }, [rowDiffs.length]);

  const onClickHideUnchangedCol = () => {
    setHideUnchangedCols(() => !hideUnchangedCols);
    toggleHideUnchangedCols(true);
  };

  return { removeCol, onClickHideUnchangedCol, hideUnchangedCols };
}
