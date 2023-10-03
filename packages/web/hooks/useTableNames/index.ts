import { useTableNamesQuery } from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  loading: boolean;
  error?: ApolloErrorType;
  tables?: string[];
  refetch: () => Promise<void>;
};

export default function useTableNames(params: DatabaseParams): ReturnType {
  const { data, ...res } = useTableNamesQuery({
    variables: { databaseName: params.databaseName },
    fetchPolicy: "cache-and-network",
  });
  const [err, setErr] = useApolloError(res.error);
  const [tables, setTables] = useState(data?.tableNames.list);

  const refetch = async () => {
    try {
      const newRes = await res.refetch();
      setTables(newRes.data.tableNames.list);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  useEffect(() => {
    setTables(data?.tableNames.list);
  }, [data, setTables]);

  return { ...res, error: err, tables, refetch };
}
