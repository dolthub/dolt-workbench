import { Child, Command } from "@tauri-apps/plugin-shell";
import { resolveResource, appDataDir } from "@tauri-apps/api/path";
import React, { createContext, useContext, useState, ReactNode, useMemo, useRef } from "react";
import { useEffectAsync } from "@dolthub/react-hooks";
import { Loader } from "@dolthub/react-components";

interface TauriContextType {
  doltServerProcess: { current: Child | undefined };
  graphQlServerProcess: { current: Child | undefined };
  serverReady: boolean;
}

const TauriContext = createContext<TauriContextType | undefined>(undefined);

interface TauriProviderProps {
  children: ReactNode;
}

export function TauriProvider({ children }: TauriProviderProps) {
  const doltServerProcess = useRef<Child | undefined>(undefined);
  const graphQlServerProcess = useRef<Child | undefined>(undefined);
  const [serverReady, setServerReady] = useState(false);

  async function createGraphQlServer() {
    const resourcePath = await resolveResource('../../graphql-server/schema.gql');
    const environmentVariables = {
      NEXT_PUBLIC_FOR_TAURI: process.env.NEXT_PUBLIC_FOR_TAURI ?? "",
      NEXT_PUBLIC_USER_DATA_PATH: await appDataDir(),
      SCHEMA_PATH: resourcePath,
    }
    console.log(JSON.stringify(environmentVariables));
    const command = Command.sidecar('binaries/graphql-server', [], { env: environmentVariables });

    command.on('close', data => {
      console.log('GraphQL server closed with code', data.code);
    });

    command.stdout.on('data', line => {
      console.log('Server:', line);
    });

    command.stderr.on('data', line => {
      console.error('Server error:', line);
    });

    graphQlServerProcess.current = await command.spawn();
  }

  async function isGraphQLServerReady(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ __typename }" }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error pinging GraphQL server:", error);
      return false;
    }
  }

  async function waitForGraphQLServer(
      url: string,
      timeout: number = 30000,
  ): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      console.log(`Waiting for GraphQL server...`);
      const isReady = await isGraphQLServerReady(url);
      if (isReady) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error("Timed out starting GraphQL server");
  }

  async function startGraphQlServer() {
    await createGraphQlServer();
    await waitForGraphQLServer("http://localhost:9002/graphql");
  }

  useEffectAsync(async () => {
      if (process.env.NEXT_PUBLIC_FOR_TAURI === "true") {
        try {
          await startGraphQlServer();
          setServerReady(true);
        } catch (error) {
          console.error("Failed to start GraphQL server:", error);
        }
      } else {
        setServerReady(true);
      }
  });

  const contextValue = useMemo(() => {
    return {
      doltServerProcess,
      graphQlServerProcess,
      serverReady,
    }
    }, [serverReady]);

  return (
    <TauriContext.Provider value={contextValue}>
      {serverReady ? children : <Loader loaded={serverReady} />}
    </TauriContext.Provider>
  );
}

export function useTauriContext(): TauriContextType {
  const context = useContext(TauriContext);
  if (!context) {
    throw new Error("useTauriContext must be used within a TauriProvider");
  }
  return context;
}
