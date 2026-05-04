import { useApolloClient } from "@apollo/client";
import { McpServerConfig, useAgentContext } from "@contexts/agent";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import { ref } from "@lib/urls";
import { useRouter } from "next/router";
import { CSSProperties, useEffect } from "react";

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
    const conn = connectionData?.currentConnection;
    if (conn?.host) {
      const config: McpServerConfig = {
        host: conn.host,
        port: conn.port ? parseInt(conn.port, 10) : 3306,
        user: conn.user ?? "root",
        password: conn.password ?? undefined,
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
    connectionData?.currentConnection?.host,
    connectionData?.currentConnection?.user,
    connectionData?.currentConnection?.password,
    connectionData?.currentConnection?.port,
    connectionData?.currentConnection?.useSSL,
    connectionData?.currentConnection?.type,
    connectionData?.currentConnection?.isDolt,
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
