 import { createContextWithDisplayName } from "@dolthub/react-contexts";
import { ReactNode, useContext  } from "react";

const cfg = {
  graphqlApiUrl: process.env.GRAPHQLAPI_URL,
};

export type ServerConfig = typeof cfg;
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
  return(
    <ServerConfigContext.Provider value={cfg}>
      {children}
    </ServerConfigContext.Provider>
  )
}

export function useServerConfig(): ServerConfigContextValue {
  return useContext(ServerConfigContext);
}
