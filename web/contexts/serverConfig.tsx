import ErrorMsg from "@components/ErrorMsg";
import { Loader } from "@dolthub/react-components";
import { createContextWithDisplayName } from "@dolthub/react-contexts";
import { ReactNode, useContext } from "react";
import useSWR from "swr";
import { ServerConfig } from "../pages/api/config";

export type ServerConfigContextValue = Partial<ServerConfig>;

export const ServerConfigContext =
  createContextWithDisplayName<ServerConfigContextValue>(
    {},
    "ServerConfigContext",
  );

type Props = {
  children: ReactNode;
};

// ServerConfigProvider needs to wrap every page, and is only used in _app
export function ServerConfigProvider({ children }: Props): JSX.Element {
  const { data, error } = useSWR<ServerConfigContextValue>("/api/config");

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
