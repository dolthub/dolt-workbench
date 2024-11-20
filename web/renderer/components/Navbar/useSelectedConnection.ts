import {
  DatabaseConnectionFragment,
  DatabaseType,
  useDatabasesByConnectionMutation,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { useState } from "react";

type ReturnType = {
  onSelected: (connectionName: string) => Promise<void>;
  databases: string[];
  loading: boolean;
  err: ApolloErrorType | undefined;
  storedConnections: DatabaseConnectionFragment[];
};

export default function useSelectedConnection(): ReturnType {
  const connectionsRes = useStoredConnectionsQuery();
  const storedConnections = connectionsRes.data?.storedConnections || [];
  const [databases, setDatabases] = useState<string[]>([]);
  const [getDbs] = useDatabasesByConnectionMutation();
  const [loading, setLoading] = useState(connectionsRes.loading);
  const [err, setErr] = useApolloError(connectionsRes.error);
  console.log("storedConnections", storedConnections);
  const onSelected = async (connectionName: string) => {
    setLoading(true);
    setErr(undefined);
    try {
      const selected = storedConnections.find(c => c.name === connectionName);
      const dbs = await getDbs({
        variables: {
          connectionUrl: selected?.connectionUrl || "",
          type: selected?.type || DatabaseType.Mysql,
          name: selected?.name || "",
          useSSL: selected?.useSSL || true,
        },
      });
      setDatabases(dbs.data?.databasesByConnection.databases || []);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    } finally {
      setLoading(false);
    }
  };

  return { onSelected, databases, loading, err, storedConnections };
}
