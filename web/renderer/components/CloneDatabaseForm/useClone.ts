import { SyntheticEvent, useEffect, useState } from "react";
import useMutation from "@hooks/useMutation";
import { useSetState } from "@dolthub/react-hooks";
import {
  DatabasesByConnectionDocument,
  useAddDatabaseConnectionMutation,
  useDoltCloneMutation,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import { getConnectionUrl } from "@components/pageComponents/ConnectionsPage/NewConnection/context/utils";
import { useRouter } from "next/router";
import { database, maybeDatabase } from "@lib/urls";
import { ConfigState } from "@components/pageComponents/ConnectionsPage/NewConnection/context/state";

export function useClone(connectionState: ConfigState) {
  const [state, setState] = useSetState(connectionState);
  const router = useRouter();

  const { mutateFn: doltClone, err: cloneErr } = useMutation({
    hook: useDoltCloneMutation,
    refetchQueries: [{ query: DatabasesByConnectionDocument }],
  });
  const { mutateFn, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
  });
  const connectionsRes = useStoredConnectionsQuery();

  const [err, setErr] = useState<Error | undefined>(
    res.err || cloneErr || connectionsRes.error,
  );

  useEffect(() => {
    if (!res.err && !cloneErr) return;
    setErr(res.err || cloneErr);
  }, [res.err, cloneErr]);

  const onCloneDoltHubDatabase = async (
    e: SyntheticEvent,
    useSSL: boolean,
    forInit?: boolean,
  ) => {
    e.preventDefault();
    setState({ loading: true, progress: 0 });
    let interval;
    let progress = 0;
    try {
      interval = setInterval(() => {
        progress += 0.05;
        setState({
          progress: Math.min(progress, 95),
        });
      }, 10);
      if (forInit) {
        const result = await window.ipc.invoke(
          "clone-dolthub-db",
          state.owner.trim(),
          state.database.trim(),
          state.name,
          state.port,
        );
        if (result !== "success") {
          setErr(Error(result));
          return;
        }
        // Complete progress to 100%
        setState({ progress: 100 });

        const db = await mutateFn({
          variables: {
            name: state.name,
            connectionUrl: getConnectionUrl(state),
            hideDoltFeatures: state.hideDoltFeatures,
            useSSL,
            type: state.type,
            isLocalDolt: state.isLocalDolt,
            port: state.port,
          },
        });
        await res.client.clearStore();
        if (!db.data) {
          return;
        }
        const { href, as } = maybeDatabase(
          db.data.addDatabaseConnection.currentDatabase,
        );
        await router.push(href, as);
      } else {
        const { success } = await doltClone({
          variables: {
            ownerName: state.owner.trim(),
            databaseName: state.database.trim(),
          },
        });
        if (!success) {
          return;
        }
        // Complete progress to 100%
        setState({ progress: 100 });

        const { href, as } = database({ databaseName: state.database.trim() });
        router.push(href, as).catch(console.error);
      }
    } catch (error) {
      setErr(Error(` ${error}`));
    } finally {
      if (interval) {
        clearInterval(interval);
      }
      setState({
        loading: false,
        progress: state.progress === 100 ? 0 : state.progress,
      });
    }
  };

  return {
    onCloneDoltHubDatabase,
    err,
    setErr,
    state,
    setState,
    storedConnections: connectionsRes.data?.storedConnections,
  };
}
