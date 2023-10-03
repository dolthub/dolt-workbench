import {
  TableForSchemaListFragment,
  useTableListForSchemasQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  loading: boolean;
  error?: ApolloErrorType;
  tables?: TableForSchemaListFragment[];
  refetch: () => Promise<void>;
};

export default function useTableList(params: DatabaseParams): ReturnType {
  const { data, ...res } = useTableListForSchemasQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const [tables, setTables] = useState(data?.tables);
  const [err, setErr] = useApolloError(res.error);

  const refetch = async () => {
    try {
      const newRes = await res.refetch();
      setTables(newRes.data.tables);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  useEffect(() => {
    setTables(data?.tables);
  }, [data, setTables]);

  return { ...res, error: err, tables, refetch };
}
