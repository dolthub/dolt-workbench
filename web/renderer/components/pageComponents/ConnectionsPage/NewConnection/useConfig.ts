import { useEffectOnMount, useSetState } from "@dolthub/react-hooks";
import {
  DatabaseType,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";
import { Dispatch, SyntheticEvent, useEffect } from "react";

const defaultState = {
  name: "",
  host: "",
  hostPlaceholder: "127.0.0.1",
  port: "3306",
  username: "root",
  password: "",
  database: "",
  connectionUrl: "",
  hideDoltFeatures: false,
  useSSL: true,
  showAbout: true,
  showConnectionDetails: false,
  showAdvancedSettings: false,
  loading: false,
  type: DatabaseType.Mysql,
};

type ConfigState = typeof defaultState;
type ConfigDispatch = Dispatch<Partial<ConfigState>>;

function getDefaultState(isDocker = false): ConfigState {
  const defaultHost = isDocker ? "host.docker.internal" : "127.0.0.1";
  return {
    ...defaultState,
    host: defaultHost,
    hostPlaceholder: defaultHost,
  };
}

type ReturnType = {
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  state: ConfigState;
  setState: ConfigDispatch;
  error?: Error | undefined;
  clearState: () => void;
};

export default function useConfig(): ReturnType {
  const router = useRouter();

  const [state, setState] = useSetState(defaultState);
  const { mutateFn, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
  });

  useEffectOnMount(() => {
    const isDocker = window.location.origin === "http://localhost:3000";
    setState(getDefaultState(isDocker));
  });

  useEffect(() => {
    if (!res.err) return;
    if (
      res.err.message.includes("The server does not support SSL connections")
    ) {
      setState({ showAdvancedSettings: true });
    }
  }, [res.err]);

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

  return { onSubmit, state, setState, error: res.err, clearState };
}

function getConnectionUrl(state: ConfigState): string {
  if (state.connectionUrl) return state.connectionUrl;
  const prefix = state.type === DatabaseType.Mysql ? "mysql" : "postgresql";
  return `${prefix}://${state.username}:${state.password}@${state.host}:${state.port}/${state.database}`;
}

export function getCanSubmit(state: ConfigState): boolean {
  if (!state.name) return false;
  if (state.connectionUrl) return true;
  if (!state.host || !state.username) return false;
  return true;
}
