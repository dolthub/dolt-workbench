import { ErrorMsg, Loader } from "@dolthub/react-components";
import { createContextWithDisplayName } from "@dolthub/react-contexts";
import { useEffectAsync } from "@dolthub/react-hooks";
import { ReactNode, useContext, useState } from "react";
import useSWR from "swr";
import useTauri from "@hooks/useTauri";

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

type ServerConfigReturnType = {
  data: ServerConfigContextValue | undefined;
  error: any;
};

type InnerProps = Props &
  ServerConfigReturnType & {
    children: ReactNode;
  };

// Custom hook to fetch the server config using IPC
function useServerConfigIPC(): ServerConfigReturnType {
  const [data, setData] = useState<ServerConfigContextValue | undefined>(
    undefined,
  );
  const [error, setError] = useState<any>(undefined);
  const { apiConfig } = useTauri();

  useEffectAsync(async () => {
    const fetchConfig = async () => {
      if (process.env.NEXT_PUBLIC_FOR_TAURI === "true") {
        const config = apiConfig();
        setData(config);
      } else {
        try {
          const config = await window.ipc.invoke("api-config");
          setData(config);
        } catch (err) {
          setError(err);
        }
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
  // For Electron, use IPC to fetch config, otherwise use API, since api routes are not available in Electron
  return process.env.NEXT_PUBLIC_FOR_ELECTRON === "true" ||
    process.env.NEXT_PUBLIC_FOR_TAURI === "true" ? (
    <IPCConfigProvider>{children}</IPCConfigProvider>
  ) : (
    <APIConfigProvider>{children}</APIConfigProvider>
  );
}

function Provider({ children, data, error }: InnerProps): JSX.Element {
  if (error) {
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
