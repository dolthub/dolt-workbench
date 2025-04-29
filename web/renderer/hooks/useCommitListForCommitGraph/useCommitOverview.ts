import { useOnClickOutside, useSetState } from "@dolthub/react-hooks";
import { RefParams } from "@lib/params";
import { Diff } from "commit-graph";
import { useRef } from "react";
import useDiffForTableListLazy from "./useDiffForTableListLazy";

const defaultState = {
  showOverview: false,
  showOverviewButton: false,
  diffOverview: undefined as Diff | undefined,
};

type CommitOverviewState = typeof defaultState;

export function useCommitOverview(params: RefParams) {
  const [state, setState] = useSetState<CommitOverviewState>(defaultState);

  const diffRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(diffRef, () => {
    setState({ showOverview: false });
  });
  const { getDiff, err, loading } = useDiffForTableListLazy(params);

  return {
    state,
    setState,
    diffRef,
    getDiff,
    err,
    loading,
  };
}
