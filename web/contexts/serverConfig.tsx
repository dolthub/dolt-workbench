// import { ErrorMsg, Loader } from "@dolthub/react-components";
import { createContextWithDisplayName } from "@dolthub/react-contexts";
// import { useEffectAsync } from "@dolthub/react-hooks";
import { ReactNode, useContext, useState } from "react";

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

// Custom hook to fetch the server config using IPC
// function useServerConfigIPC(): {
//   data: ServerConfigContextValue | null;
//   error: any;
// } {
//   const [data, setData] = useState<ServerConfigContextValue | null>(null);
//   const [error, setError] = useState<any>(null);

//   useEffectAsync(async () => {
//     const fetchConfig = async () => {
//       try {
//         const config = await window.ipc.invoke("api-config");
//         setData(config);
//       } catch (err) {
//         setError(err);
//       }
//     };

//     await fetchConfig();
//   }, []);

//   return { data, error };
// }

// ServerConfigProvider needs to wrap every page, and is only used in _app
export function ServerConfigProvider({ children }: Props): JSX.Element {
  // const { data, error } = useServerConfigIPC();

  // if (error) {
  //   return (
  //     <>
  //       <ErrorMsg err={error} />
  //       {children}
  //     </>
  //   );
  // }
  
const data: ServerConfigContextValue = {
  graphqlApiUrl:undefined,
};
  return  (
    <ServerConfigContext.Provider value={{ ...data }}>
      {children}
    </ServerConfigContext.Provider>
  )  
}

export function useServerConfig(): ServerConfigContextValue {
  return useContext(ServerConfigContext);
}
