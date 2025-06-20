import { ApolloError } from "@apollo/client";
import { SchemaItemFragment, useRowsForViewsQuery } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  loading: boolean;
  error?: ApolloError;
  views?: SchemaItemFragment[];
  refetch: () => Promise<void>;
};

export default function useViewList(
  params: RefOptionalSchemaParams,
): ReturnType {
  const { data, ...res } = useRowsForViewsQuery({
    variables: params,
  });
  const [views, setViews] = useState(data?.views);

  useEffect(() => {
    setViews(data?.views);
  }, [data, setViews]);

  const refetch = async () => {
    try {
      const newRes = await res.refetch(params);
      setViews(newRes.data.views);
    } catch {
      // Do not want to error if the dolt_schemas system table does not exist
    }
  };

  return { ...res, views, refetch };
}
