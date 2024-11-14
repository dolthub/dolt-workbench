import { useCallback, useState } from "react";
import { ChangedItem, Diff } from "commit-graph";
import { errorMatches, handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import {
  DiffSummaryFragment,
  useDiffSummariesLazyQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import useApolloError from "../useApolloError";

type ReturnType = {
  loading: boolean;
  err: ApolloErrorType;
  getDiff: (base: string, head: string) => Promise<Diff | undefined>;
};

export default function useDiffForTableListLazy(params: RefParams): ReturnType {
  const [err, setErr] = useApolloError(undefined);
  const [loading, setLoading] = useState(false);
  const [getDiffSummaries] = useDiffSummariesLazyQuery();

  const getDiff = useCallback(
    async (base: string, head: string): Promise<Diff | undefined> => {
      setLoading(true);
      const variables = {
        ...params,
        fromRefName: base,
        toRefName: head,
      };
      try {
        const res = await getDiffSummaries({ variables });
        if (!res.data) {
          if (
            res.error &&
            !errorMatches(
              "cannot perform a diff between keyed and keyless tables",
              res.error,
            )
          ) {
            setErr(res.error);
          }
          return undefined;
        }
        return {
          files: mapTableDiffsToChangedItems(res.data.diffSummaries),
        };
      } catch (e) {
        handleCaughtApolloError(e, setErr);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [getDiffSummaries, params, setErr],
  );

  return {
    getDiff,
    err,
    loading,
  };
}

function mapTableDiffsToChangedItems(
  diffSummaries: DiffSummaryFragment[],
): ChangedItem[] {
  return diffSummaries.map(diffSummary => {
    const changed: ChangedItem = {
      filename: diffSummary.tableName || "",
      status:
        diffSummary.tableType === "Dropped"
          ? "deleted"
          : diffSummary.tableType.toLowerCase(),
    };
    return changed;
  });
}
