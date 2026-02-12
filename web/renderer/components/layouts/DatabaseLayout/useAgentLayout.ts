import { useApolloClient } from "@apollo/client";
import { McpServerConfig, useAgentContext } from "@contexts/agent";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import { ref } from "@lib/urls";
import { useRouter } from "next/router";
import { CSSProperties, useEffect } from "react";

function parseConnectionUrl(connectionUrl: string): {
  host: string;
  port: number;
  user: string;
  password?: string;
} {
  try {
    const url = new URL(connectionUrl);
    return {
      host: url.hostname || "127.0.0.1",
      port: parseInt(url.port, 10) || 3306,
      user: url.username || "root",
      password: url.password || undefined,
    };
  } catch (e) {
    console.error("parseConnectionUrl error:", e);
    return { host: "127.0.0.1", port: 3306, user: "root" };
  }
}

type AgentLayoutState = {
  contentStyle: CSSProperties;
};

export default function useAgentLayout(
  databaseName: string,
  showSmallHeader: boolean,
): AgentLayoutState {
  const { setMcpConfig, isPanelOpen, panelWidth, setHasSmallHeader } =
    useAgentContext();
  const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { data: connectionData } = useCurrentConnectionQuery();

  // Update MCP config in global agent context when connection changes
  useEffect(() => {
    if (connectionData?.currentConnection?.connectionUrl) {
      const conn = connectionData.currentConnection;
      const parsed = parseConnectionUrl(conn.connectionUrl);
      const config: McpServerConfig = {
        ...parsed,
        port: conn.port ? parseInt(conn.port, 10) : parsed.port,
        database: databaseName,
        useSSL: conn.useSSL ?? false,
        type: conn.type ?? undefined,
        isDolt: conn.isDolt ?? false,
      };
      setMcpConfig(config);
    } else {
      setMcpConfig(null);
    }

    return () => {
      setMcpConfig(null);
    };
  }, [
    connectionData?.currentConnection?.connectionUrl,
    connectionData?.currentConnection?.port,
    connectionData?.currentConnection?.useSSL,
    connectionData?.currentConnection?.type,
    databaseName,
    setMcpConfig,
  ]);

  // Sync header state with agent context for panel positioning
  useEffect(() => {
    setHasSmallHeader(showSmallHeader);
  }, [showSmallHeader, setHasSmallHeader]);

  // Handle agent branch switch requests
  useEffect(() => {
    const handleBranchSwitch: EventListener = (event: Event) => {
      const branchName = (event as CustomEvent<string>).detail;
      if (!branchName || !databaseName) return;

      const newUrl = ref({
        databaseName,
        refName: branchName,
      });
      router.push(newUrl.href, newUrl.as).catch(console.error);
    };

    window.addEventListener("agent-switch-branch", handleBranchSwitch);
    return () => {
      window.removeEventListener("agent-switch-branch", handleBranchSwitch);
    };
  }, [router, databaseName]);

  // Handle agent page refresh requests
  useEffect(() => {
    const handleRefreshPage = async () => {
      await apolloClient.resetStore();
      await router.push(router.asPath);
    };

    window.addEventListener("agent-refresh-page", handleRefreshPage);
    return () => {
      window.removeEventListener("agent-refresh-page", handleRefreshPage);
    };
  }, [apolloClient, router]);

  const contentStyle: CSSProperties =
    isElectron && isPanelOpen
      ? { marginRight: panelWidth, transition: "margin-right 0.2s ease" }
      : {};

  return { contentStyle };
}
