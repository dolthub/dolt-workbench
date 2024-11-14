import { useOnClickOutside } from "@dolthub/react-hooks";
import { useRef, useState } from "react";
import { RefParams } from "@lib/params";
import { Diff } from "commit-graph";
import useDiffForTableListLazy from "./useDiffForTableListLazy";

export function useCommitOverview(params: RefParams) {
  const [showOverview, setShowOverview] = useState(false);
  const [showOverviewButton, setShowOverviewButton] = useState(false);
  const diffRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(diffRef, () => {
    setShowOverview(false);
  });
  const [diffOverview, setDiff] = useState<Diff | undefined>(undefined);
  const { getDiff, err, loading } = useDiffForTableListLazy(params);

  return {
    showOverview,
    setShowOverview,
    showOverviewButton,
    setShowOverviewButton,
    diffRef,
    diffOverview,
    setDiff,
    getDiff,
    err,
    loading,
  };
}
