import { Command, Child } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { resolveResource, appDataDir } from "@tauri-apps/api/path";
import useDoltServer from "@hooks/useTauri/useDoltServer";


export default function useTauri() {
  const [graphQlServerProcess, setGraphQlServerProcess] = useState<Child>();
  const { startDoltServer } = useDoltServer();

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

    setGraphQlServerProcess(await command.spawn());
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

  function apiConfig() {
    return {
      graphqlApiUrl: process.env.GRAPHQLAPI_URL,
    }
  }

  return { startGraphQlServer, apiConfig, startDoltServer };
}
