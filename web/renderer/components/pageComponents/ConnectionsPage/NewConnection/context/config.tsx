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
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { database, maybeDatabase } from "@lib/urls";
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
  const { mutateFn, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
  });

  const { mutateFn: doltClone, err: cloneErr } = useMutation({
    hook: useDoltCloneMutation,
    refetchQueries: [{ query: DatabasesByConnectionDocument }],
  });

  const connectionsRes = useStoredConnectionsQuery();
  const [err, setErr] = useState<Error | undefined>(
    res.err || connectionsRes.error,
  );

  useEffectOnMount(() => {
    const isDocker = window.location.origin === "http://localhost:3000";
    setState(getDefaultState(isDocker));
  });

  useEffect(() => {
    if (!res.err && !cloneErr) return;
    setErr(res.err || cloneErr);
    if (
      res.err?.message.includes("The server does not support SSL connections")
    ) {
      setState({ showAdvancedSettings: true });
    }
  }, [res.err, cloneErr]);

  useEffectOnMount(() => {
    if (!forElectron) return;
    window.ipc.getDoltServerError(async (msg: string) => {
      setErr(Error(msg));
    });
  });

  const clearState = () => {
    setState(defaultState);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setState({ loading: true });

    try {
      const db = await mutateFn({
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
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } = maybeDatabase(
        db.data.addDatabaseConnection.currentDatabase,
      );
      await router.push(href, as);
    } catch (_) {
      // Handled by res.error
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

  const onCloneDoltHubDatabase = async (e: SyntheticEvent, init?: boolean) => {
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
      if (init) {
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

        await onSubmit(e);
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
  ]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfigContext(): ConfigContextType {
  return useContextWithError(ConfigContext);
}
