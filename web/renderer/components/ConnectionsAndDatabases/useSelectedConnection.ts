import { useSetState } from "@dolthub/react-hooks";
import {
  DatabaseConnectionFragment,
  useDatabasesByConnectionLazyQuery,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";

export type StateType = {
  connection: DatabaseConnectionFragment;
  databases: string[];
  err: ApolloErrorType | undefined;
  loading: boolean;
};

type ReturnType = {
  onSelected: (connection: DatabaseConnectionFragment) => Promise<void>;
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
    err: undefined as ApolloErrorType | undefined,
    loading: false,
  });
  const [getDbs] = useDatabasesByConnectionLazyQuery();

  const onSelected = async (connection: DatabaseConnectionFragment) => {
    setState({
      loading: true,
      err: undefined,
    });
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
      handleCaughtApolloError(e, er => setState({ err: er }));
    } finally {
      setState({ loading: false });
    }
  };

  return { onSelected, state, setState, storedConnections };
}
