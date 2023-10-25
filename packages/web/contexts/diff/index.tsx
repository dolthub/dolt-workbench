import { ApolloError } from "@apollo/client";
import { DiffSummaryFragment, useDiffSummariesQuery } from "@gen/graphql-types";
import useContextWithError from "@hooks/useContextWithError";
import { createCustomContext } from "@lib/createCustomContext";
import { RequiredCommitsParams } from "@lib/params";
import { ReactNode, useEffect, useMemo, useState } from "react";

type Props = {
  children: ReactNode;
  params: RequiredCommitsParams & { refName?: string };
  initialTableName?: string;
  stayWithinPage?: boolean;
};

// This contexts handles the diff summaries for the diff page
type DiffContextType = {
  diffSummaries: DiffSummaryFragment[];
  loading: boolean;
  error?: ApolloError;
  params: RequiredCommitsParams;
  activeTableName: string;
  setActiveTableName: (a: string) => void;
  refName: string;
  setRefName: (r: string) => void;
  stayWithinPage: boolean; // Changing tables within diff doesn't change URL
};

export const DiffContext = createCustomContext<DiffContextType>("DiffContext");

// DiffProvider should only be used in all pages with diffs
export function DiffProvider({
  params,
  children,
  initialTableName,
  stayWithinPage = false,
}: Props): JSX.Element {
  const [activeTableName, setActiveTableName] = useState(
    initialTableName ?? "",
  );
  const [refName, setRefName] = useState(params.refName ?? "");
  const { data, error, loading } = useDiffSummariesQuery({
    variables: params,
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
  ]);

  return <DiffContext.Provider value={value}>{children}</DiffContext.Provider>;
}

export function useDiffContext(): DiffContextType {
  return useContextWithError(DiffContext);
}
