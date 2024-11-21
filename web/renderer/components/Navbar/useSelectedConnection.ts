import {
  DatabaseType,
  useDatabasesByConnectionLazyQuery,
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
};

export default function useSelectedConnection(): ReturnType {
  const connectionsRes = useStoredConnectionsQuery();
  const [databases, setDatabases] = useState<string[]>([]);
  const [getDbs] = useDatabasesByConnectionLazyQuery();
  const [loading, setLoading] = useState(connectionsRes.loading);
  const [err, setErr] = useApolloError(connectionsRes.error);

  const onSelected = async (connectionName: string) => {
    setLoading(true);
    setErr(undefined);
    try {
      const selected = connectionsRes.data?.storedConnections.find(
        c => c.name === connectionName,
      );
      if (!selected) {
        setErr(new Error("Connection not found"));
        return;
      }
      const dbs = await getDbs({
        variables: {
          connectionUrl: selected.connectionUrl || "",
          type: selected.type || DatabaseType.Mysql,
          name: selected.name || "",
          useSSL: selected.useSSL || true,
        },
      });
      setDatabases(dbs.data?.databasesByConnection || []);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    } finally {
      setLoading(false);
    }
  };

  return { onSelected, databases, loading, err };
}
