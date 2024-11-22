import { useSetState } from "@dolthub/react-hooks";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  useDatabasesByConnectionLazyQuery,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { useEffect, useState } from "react";

type StateType = {
  databases: string[];
  connection: DatabaseConnectionFragment;
};

type ReturnType = {
  onSelected: (connection: DatabaseConnectionFragment) => Promise<void>;
  loading: boolean;
  err: ApolloErrorType | undefined;
  storedConnections: DatabaseConnectionFragment[];
  state: StateType;
  setState: (s: StateType) => void;
};

export default function useSelectedConnection(
  conn: DatabaseConnectionFragment,
): ReturnType {
  const connectionsRes = useStoredConnectionsQuery();
  const storedConnections = connectionsRes.data?.storedConnections || [];
  const [state, setState] = useSetState({
    databases: [] as string[],
    connection: conn,
  });
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
      setState({
        connection,
        databases: dbs.data?.databasesByConnection || [],
      });
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onSelected(conn);
  }, [conn]);

  return { onSelected, state, setState, loading, err, storedConnections };
}
