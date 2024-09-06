import { ErrorMsg, Loader } from "@dolthub/react-components";
import { createContextWithDisplayName } from "@dolthub/react-contexts";
import { useEffectAsync } from "@dolthub/react-hooks";
import { ReactNode, useContext, useState } from "react";
import useSWR from "swr";

type ServerConfig = {
  graphqlApiUrl: string | undefined;
};

export type ServerConfigContextValue = Partial<ServerConfig>;

export const ServerConfigContext =
  createContextWithDisplayName<ServerConfigContextValue>(
    {},
    "ServerConfigContext",
  );

type Props = {
  children: ReactNode;
};

type InnerProps = Props & {
  children: ReactNode;
  data: ServerConfigContextValue | undefined;
  error: any;
};

// Custom hook to fetch the server config using IPC
function useServerConfigIPC(): {
  data: ServerConfigContextValue | undefined;
  error: any;
} {
  const [data, setData] = useState<ServerConfigContextValue | undefined>(
    undefined,
  );
  const [error, setError] = useState<any>(undefined);

  useEffectAsync(async () => {
    const fetchConfig = async () => {
      try {
        const config = await window.ipc.invoke("api-config");
        setData(config);
      } catch (err) {
        setError(err);
      }
    };

    await fetchConfig();
  }, []);

  return { data, error };
}

function APIConfigProvider({ children }: Props): JSX.Element {
  const { data, error } = useSWR<ServerConfigContextValue>("/api/config");
  return (
    <Provider data={data} error={error}>
      {children}
    </Provider>
  );
}

function IPCConfigProvider({ children }: Props): JSX.Element {
  const { data, error } = useServerConfigIPC();
  return (
    <Provider data={data} error={error}>
      {children}
    </Provider>
  );
}

// ServerConfigProvider needs to wrap every page, and is only used in _app
export function ServerConfigProvider({ children }: Props): JSX.Element {
  return process.env.NEXT_PUBLIC_FOR_ELECTRON === "true" ? (
    <IPCConfigProvider>{children}</IPCConfigProvider>
  ) : (
    <APIConfigProvider>{children}</APIConfigProvider>
  );
}

function Provider({ children, data, error }: InnerProps): JSX.Element {
  if (error) {
    error.message = `Failed to fetch server config,data:${data},error:${error}, ${error.message}`;
    return (
      <>
        <ErrorMsg err={error} />
        {children}
      </>
    );
  }

  return data ? (
    <ServerConfigContext.Provider value={{ ...data }}>
      {children}
    </ServerConfigContext.Provider>
  ) : (
    <Loader loaded={false} />
  );
}

export function useServerConfig(): ServerConfigContextValue {
  return useContext(ServerConfigContext);
}
