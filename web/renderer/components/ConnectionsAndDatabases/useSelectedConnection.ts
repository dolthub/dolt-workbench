import {
  DatabaseConnectionFragment,
  DatabaseType,
  useDatabasesByConnectionLazyQuery,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { useState } from "react";

type ReturnType = {
  onSelected: (connection: DatabaseConnectionFragment) => Promise<void>;
  databases: string[];
  loading: boolean;
  err: ApolloErrorType | undefined;
  storedConnections: DatabaseConnectionFragment[];
};

export default function useSelectedConnection(): ReturnType {
  const connectionsRes = useStoredConnectionsQuery();
  const storedConnections = connectionsRes.data?.storedConnections || [];
  const [databases, setDatabases] = useState<string[]>([]);
  const [getDbs] = useDatabasesByConnectionLazyQuery();
  const [loading, setLoading] = useState(connectionsRes.loading);
  const [err, setErr] = useApolloError(connectionsRes.error);
  const onSelected = async (connection: DatabaseConnectionFragment) => {
    setLoading(true);
    setErr(undefined);
    try {
      const dbs = await getDbs({
        variables: {
          ...connection,
        },
      });
      setDatabases(dbs.data?.databasesByConnection || []);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    } finally {
      setLoading(false);
    }
  };

  return { onSelected, databases, loading, err, storedConnections };
}
