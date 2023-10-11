import { ApolloError } from "@apollo/client";
import { RowForViewsFragment, useRowsForViewsQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  loading: boolean;
  error?: ApolloError;
  views?: RowForViewsFragment[];
  refetch: () => Promise<void>;
};

export default function useViewList(params: RefParams): ReturnType {
  const { data, ...res } = useRowsForViewsQuery({
    variables: params,
  });
  const [views, setViews] = useState(data?.views.list);

  useEffect(() => {
    setViews(data?.views.list);
  }, [data, setViews]);

  const refetch = async () => {
    try {
      const newRes = await res.refetch(params);
      setViews(newRes.data.views.list);
    } catch (_) {
      // Do not want to error if the dolt_schemas system table does not exist
    }
  };

  return { ...res, views, refetch };
}
