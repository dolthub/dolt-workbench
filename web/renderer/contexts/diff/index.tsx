import { ApolloError } from "@apollo/client";
import { useContextWithError } from "@dolthub/react-hooks";
import {
  CommitDiffType,
  DiffSummaryFragment,
  useDiffSummariesQuery,
} from "@gen/graphql-types";
import { createCustomContext } from "@lib/createCustomContext";
import { RequiredRefsParams } from "@lib/params";
import { ReactNode, useEffect, useMemo, useState } from "react";

type Props = {
  children: ReactNode;
  params: RequiredRefsParams & { refName?: string; schemaName?: string };
  initialTableName?: string;
  stayWithinPage?: boolean;
  forPull?: boolean;
};

// This contexts handles the diff summaries for the diff page
type DiffContextType = {
  diffSummaries: DiffSummaryFragment[];
  loading: boolean;
  error?: ApolloError;
  params: RequiredRefsParams;
  activeTableName: string;
  setActiveTableName: (a: string) => void;
  refName: string;
  setRefName: (r: string) => void;
  stayWithinPage: boolean; // Changing tables within diff doesn't change URL
  type: CommitDiffType;
};

export const DiffContext = createCustomContext<DiffContextType>("DiffContext");

// DiffProvider should only be used in all pages with diffs
export function DiffProvider({
  params,
  children,
  initialTableName,
  stayWithinPage = false,
  forPull = false,
}: Props): JSX.Element {
  const type = forPull ? CommitDiffType.ThreeDot : CommitDiffType.TwoDot;
  const [activeTableName, setActiveTableName] = useState(
    initialTableName ?? "",
  );
  const [refName, setRefName] = useState(params.refName ?? "");
  const { data, error, loading } = useDiffSummariesQuery({
    variables: { ...params, type },
  });

  useEffect(() => {
    if (initialTableName || !data) return;
    if (data.diffSummaries.length === 0) return;
    setActiveTableName(data.diffSummaries[0].tableName);
  }, [data, initialTableName]);

  const value = useMemo(() => {
    return {
      loading,
      error,
      diffSummaries: data?.diffSummaries || [],
      params,
      activeTableName,
      setActiveTableName,
      refName,
      setRefName,
      stayWithinPage,
      type,
    };
  }, [
    data,
    error,
    loading,
    params,
    activeTableName,
    setActiveTableName,
    refName,
    setRefName,
    stayWithinPage,
    type,
  ]);

  return <DiffContext.Provider value={value}>{children}</DiffContext.Provider>;
}

export function useDiffContext(): DiffContextType {
  return useContextWithError(DiffContext);
}
