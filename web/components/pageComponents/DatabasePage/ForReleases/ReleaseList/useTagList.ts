import { useEffect, useState } from "react";
import { TagForListFragment, useTagListQuery } from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";

type ReturnType = {
  tags: TagForListFragment[] | undefined;
  loadMore: () => Promise<void>;
  error?: ApolloErrorType;
  loading: boolean;
  hasMore: boolean;
  refetch: () => Promise<void>;
};

export function useTagList(params: DatabaseParams): ReturnType {
  const { data, ...res } = useTagListQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const [err, setErr] = useApolloError(res.error);
  const [tags, setTags] = useState(data?.tags.list);
  // const [pageToken, setPageToken] = useState(data?.commits.nextPageToken);
  // const [lastPageToken, setLastPageToken] = useState("");

  const refetch = async () => {
    try {
      const newRes = await res.refetch(params);
      setTags(newRes.data.tags.list);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  useEffect(() => {
    setTags(data?.tags.list);
    // setPageToken(data?.tags.nextPageToken);
  }, [data, setTags]);

  const loadMore = async () => {};
  const hasMore = false;
  // const hasMore = !!pageToken && pageToken !== lastPageToken;

  return { ...res, error: err, tags, loadMore, hasMore, refetch };
}
