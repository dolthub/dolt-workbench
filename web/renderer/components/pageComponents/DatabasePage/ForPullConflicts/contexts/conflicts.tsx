import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import {
  PullConflictSummaryFragment,
  usePullConflictsSummaryQuery,
} from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams } from "@lib/params";
import { ReactNode, useEffect, useMemo, useState } from "react";

type ConflictsContextType = {
  activeTableName: string;
  setActiveTableName: (tableName: string) => void;
  loading: boolean;
  error?: ApolloErrorType;
  conflictsSummary?: PullConflictSummaryFragment[] | null;
};

export const ConflictsContext =
  createCustomContext<ConflictsContextType>("ConflictsContext");

type Props = {
  children: ReactNode;
  tableName?: string;
  params: PullDiffParams;
};

export function ConflictsProvider(props: Props): JSX.Element {
  const res = usePullConflictsSummaryQuery({
    variables: { ...props.params, toBranchName: props.params.refName },
  });
  const [activeTableName, setActiveTableName] = useState(props.tableName ?? "");

  useEffect(() => {
    if (props.tableName || !res.data?.pullConflictsSummary?.length) return;
    const firstTableName = res.data.pullConflictsSummary[0].tableName;
    setActiveTableName(firstTableName);
  }, [props.tableName, res.data?.pullConflictsSummary]);

  const value = useMemo(() => {
    return {
      loading: res.loading,
      error: res.error,
      conflictsSummary: res.data?.pullConflictsSummary,
      activeTableName,
      setActiveTableName,
    };
  }, [
    activeTableName,
    setActiveTableName,
    res.data?.pullConflictsSummary,
    res.error,
    res.loading,
  ]);

  return (
    <ConflictsContext.Provider value={value}>
      {props.children}
    </ConflictsContext.Provider>
  );
}

export function useConflictsContext(): ConflictsContextType {
  return useContextWithError(ConflictsContext);
}
