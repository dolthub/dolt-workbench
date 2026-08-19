import { createCustomContext } from "@dolthub/react-contexts";
import {
  useContextWithError,
  useEffectOnMount,
  useSetState,
} from "@dolthub/react-hooks";
import {
  DatabasesByConnectionDocument,
  useAddDatabaseConnectionMutation,
  useDoltCloneMutation,
  useRemoveConnectionMutation,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { maybeDatabase } from "@lib/urls";
import { ConfigContextType, defaultState, getDefaultState } from "./state";
import { getConnectionUrl } from "./utils";

export const ConfigContext =
  createCustomContext<ConfigContextType>("ConfigContext");

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const router = useRouter();

  const [state, setState] = useSetState(defaultState);
  const { mutateFn: addDatabaseConnection, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
    refetchQueries: [{ query: DatabasesByConnectionDocument }],
  });
  const { mutateFn: doltClone, ...cloneRes } = useMutation({
    hook: useDoltCloneMutation,
  });
  const [removeDatabaseConnection] = useRemoveConnectionMutation();

  const connectionsRes = useStoredConnectionsQuery();
  const [err, setErr] = useState<Error | undefined>(
    res.err || connectionsRes.error,
  );

  useEffectOnMount(() => {
    const isDocker = window.location.origin === "http://localhost:3000";
    setState(getDefaultState(isDocker));
  });

  useEffect(() => {
    if (!res.err) return;
    setErr(res.err);
    if (
      res.err.message.includes("The server does not support SSL connections")
    ) {
      setState({ showAdvancedSettings: true });
    }
  }, [res.err]);

  useEffect(() => {
    if (!cloneRes.err) return;
    setErr(cloneRes.err);
  }, [cloneRes.err]);

  useEffectOnMount(() => {
    if (!forElectron) return;
    window.ipc.getDoltServerError(async (msg: string) => {
      setErr(Error(msg));
    });
  });

  const clearState = () => {
    setState(defaultState);
  };

  const addCurrentDatabaseConnection = async () =>
    addDatabaseConnection({
      variables: {
        name: state.name,
        connectionUrl: getConnectionUrl(state),
        hideDoltFeatures: state.hideDoltFeatures,
        useSSL: state.useSSL,
        type: state.type,
        isLocalDolt: state.isLocalDolt,
        port: state.port,
      },
    });

  const openDatabase = async (currentDatabase?: string | null) => {
    await res.client.clearStore();
    const { href, as } = maybeDatabase(currentDatabase);
    await router.push(href, as);
  };

  const onSubmit = async (e: SyntheticEvent): Promise<boolean> => {
    e.preventDefault();
    setState({ loading: true });
    let connectionAdded = false;

    try {
      const db = await addCurrentDatabaseConnection();
      if (!db.success || !db.data) return false;
      connectionAdded = true;
      await openDatabase(db.data.addDatabaseConnection.currentDatabase);
      return true;
    } catch {
      // Handled by res.error
      return connectionAdded;
    } finally {
      setState({ loading: false });
    }
  };

  const onStartDoltServer = async (e: SyntheticEvent) => {
    e.preventDefault();
    setState({ loading: true });
    try {
      const result = await window.ipc.invoke(
        "start-dolt-server",
        state.name.trim(),
        state.port,
        !state.cloneDolt,
        state.database,
      );

      if (result !== "success") {
        setErr(Error(result));
        return;
      }
      await onSubmit(e);
    } catch (error) {
      setErr(Error(` ${error}`));
    } finally {
      setState({ loading: false });
    }
  };

  const runClone = async (
    e: SyntheticEvent,
    owner: string,
    newDbName: string,
    clone: () => Promise<void>,
  ) => {
    e.preventDefault();
    setErr(undefined);
    setState({ loading: true, progress: 0, database: newDbName, owner });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      setState({ progress: Math.min(progress, 95) });
    }, 10);

    try {
      await clone();
    } catch (error) {
      setErr(error instanceof Error ? error : Error(String(error)));
    } finally {
      clearInterval(interval);
      setState({ loading: false, progress: 0 });
    }
  };

  const onCloneDoltHubDatabase = async (
    e: SyntheticEvent,
    owner: string,
    remoteDbName: string,
    newDbName: string,
  ) =>
    runClone(e, owner, newDbName, async () => {
      const result = await window.ipc.invoke(
        "clone-dolthub-db",
        owner.trim(),
        remoteDbName.trim(),
        newDbName.trim(),
        state.name,
        state.port,
      );

      if (result !== "success") throw Error(result);

      setState({ progress: 100 });
      await onSubmit(e);
    });

  const onCloneDoltLiteDatabase = async (
    e: SyntheticEvent,
    owner: string,
    remoteDbName: string,
    newDbName: string,
  ) =>
    runClone(e, owner, newDbName, async () => {
      let fileCreated = false;
      let connectionAdded = false;
      let cloneComplete = false;

      try {
        await window.ipc.invoke("create-doltlite-database-file", state.name);
        fileCreated = true;

        const db = await addCurrentDatabaseConnection();
        if (!db.success || !db.data) return;
        connectionAdded = true;

        const clone = await doltClone({
          variables: {
            ownerName: owner.trim(),
            remoteDbName: remoteDbName.trim(),
            databaseName: newDbName.trim().replace(/\.db$/i, ""),
          },
        });
        if (!clone.success || !clone.data?.doltClone) return;

        cloneComplete = true;
        setState({ progress: 100 });
        await openDatabase(db.data.addDatabaseConnection.currentDatabase);
      } finally {
        if (fileCreated) {
          try {
            if (connectionAdded && !cloneComplete) {
              await removeDatabaseConnection({
                variables: { name: state.name },
              });
            }
          } finally {
            await window.ipc.invoke(
              cloneComplete
                ? "retain-created-doltlite-database-file"
                : "discard-created-doltlite-database-file",
              state.name,
            );
          }
        }
      }
    });

  const value = useMemo(() => {
    return {
      state,
      setState,
      onSubmit,
      error: err,
      setErr,
      clearState,
      storedConnections: connectionsRes.data?.storedConnections,
      onStartDoltServer,
      onCloneDoltHubDatabase,
      onCloneDoltLiteDatabase,
    };
  }, [
    state,
    setState,
    onSubmit,
    res.err,
    clearState,
    connectionsRes,
    onStartDoltServer,
    onCloneDoltHubDatabase,
    onCloneDoltLiteDatabase,
  ]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfigContext(): ConfigContextType {
  return useContextWithError(ConfigContext);
}
