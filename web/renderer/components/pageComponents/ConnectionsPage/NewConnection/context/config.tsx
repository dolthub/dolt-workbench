import { createCustomContext } from "@dolthub/react-contexts";
import {
  useContextWithError,
  useEffectOnMount,
  useSetState,
} from "@dolthub/react-hooks";
import { useAddDatabaseConnectionMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { ReactNode, SyntheticEvent, useEffect, useMemo } from "react";
import { maybeDatabase } from "@lib/urls";
import { ConfigContextType, defaultState, getDefaultState } from "./state";
import { getConnectionUrl } from "./utils";

export const ConfigContext =
  createCustomContext<ConfigContextType>("ConfigContext");

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
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
  const value = useMemo(() => {
    return {
      state,
      setState,
      onSubmit,
      error: res.err,
      clearState,
    };
  }, [state, setState, onSubmit, res.err, clearState]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfigContext(): ConfigContextType {
  return useContextWithError(ConfigContext);
}
