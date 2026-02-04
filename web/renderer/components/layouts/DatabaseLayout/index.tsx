import { useApolloClient } from "@apollo/client";
import DatabaseHeaderAndNav from "@components/DatabaseHeaderAndNav";
import DatabaseTableHeader from "@components/DatabaseTableHeader";
import DatabaseTableHeaderMobile from "@components/DatabaseTableHeader/DatabaseTableHeaderMobile";
import DatabaseTableNav from "@components/DatabaseTableNav";
import KeyNav from "@components/util/KeyNav";
import { McpServerConfig, useAgentContext } from "@contexts/agent";
import { useReactiveWidth } from "@dolthub/react-hooks";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import { DatabasePageParams } from "@lib/params";
import { RefUrl, database, ref } from "@lib/urls";
import cx from "classnames";
import { useRouter } from "next/router";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import Wrapper from "./Wrapper";
import css from "./index.module.css";

function parseConnectionUrl(connectionUrl: string): {
  host: string;
  port: number;
  user: string;
  password?: string;
} {
  try {
    // Parse connection URL like mysql://user@host:port/database
    // or mysql://user:password@host:port/database
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

type Props = {
  title?: string;
  children: ReactNode;
  params: DatabasePageParams;
  leftNavInitiallyOpen?: boolean;
  wide?: boolean;
  showSqlConsole?: boolean;
  empty?: boolean;
  initialTabIndex: number;
  routeRefChangeTo?: RefUrl;
  initialSmallHeader?: boolean;
  smallHeaderBreadcrumbs?: ReactNode;
  leftTableNav?: ReactNode;
};

export default function DatabaseLayout(props: Props) {
  const [showSmallHeader, setShowSmallHeader] = useState(
    !!props.initialSmallHeader,
  );
  const { q, tableName, ...refParams } = props.params;
  const forDataTable = !!(q || tableName);
  const showHeader = forDataTable || props.showSqlConsole || props.empty;
  const useFullWidth = forDataTable || !!props.wide;
  const { isMobile } = useReactiveWidth(1024);
  const [showTableNav, setShowTableNav] = useState(false);
  const { data: connectionData } = useCurrentConnectionQuery();
  const { setMcpConfig, isPanelOpen, panelWidth, setHasSmallHeader } =
    useAgentContext();
  const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";
  const router = useRouter();
  const apolloClient = useApolloClient();

  // Update MCP config in global agent context when connection changes
  useEffect(() => {
    if (connectionData?.currentConnection?.connectionUrl) {
      const parsed = parseConnectionUrl(
        connectionData.currentConnection.connectionUrl,
      );
      const config: McpServerConfig = {
        ...parsed,
        database: props.params.databaseName,
        useSSL: connectionData.currentConnection.useSSL ?? false,
        type: connectionData.currentConnection.type ?? undefined,
        isDolt: connectionData.currentConnection.isDolt ?? false,
      };
      setMcpConfig(config);
    } else {
      setMcpConfig(null);
    }

    // Clear mcpConfig when leaving the database page
    return () => {
      setMcpConfig(null);
    };
  }, [
    connectionData?.currentConnection?.connectionUrl,
    connectionData?.currentConnection?.useSSL,
    connectionData?.currentConnection?.type,
    props.params.databaseName,
    setMcpConfig,
  ]);

  // Sync header state with agent context for panel positioning
  useEffect(() => {
    setHasSmallHeader(showSmallHeader);
  }, [showSmallHeader, setHasSmallHeader]);

  // Handle agent branch switch requests
  useEffect(() => {
    const handleBranchSwitch = (event: CustomEvent<string>) => {
      const branchName = event.detail;
      if (!branchName || !props.params.databaseName) return;

      // Use the ref URL helper to construct the new path
      const newUrl = ref({
        databaseName: props.params.databaseName,
        refName: branchName,
      });
      router.push(newUrl.href, newUrl.as).catch(console.error);
    };

    window.addEventListener(
      "agent-switch-branch",
      handleBranchSwitch as EventListener,
    );
    return () => {
      window.removeEventListener(
        "agent-switch-branch",
        handleBranchSwitch as EventListener,
      );
    };
  }, [router, props.params.databaseName]);

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

  // Adjust content margin when agent panel is open (only in Electron)
  const contentStyle: CSSProperties =
    isElectron && isPanelOpen
      ? { marginRight: panelWidth, transition: "margin-right 0.2s ease" }
      : {};

  return (
    <Wrapper params={props.params}>
      <DatabaseHeaderAndNav
        initialTabIndex={props.initialTabIndex}
        params={refParams}
        breadcrumbs={props.smallHeaderBreadcrumbs}
        title={props.title}
        showSmall={showSmallHeader}
        setShowSmall={setShowSmallHeader}
      />
      <div
        className={cx(css.content, {
          [css.contentWithHeader]: !!showHeader,
          [css.contentWithSmallHeader]: showSmallHeader,
        })}
        style={contentStyle}
      >
        {props.leftTableNav || (
          <DatabaseTableNav
            params={props.params}
            initiallyOpen={props.leftNavInitiallyOpen}
            showTableNav={showTableNav}
            setShowTableNav={setShowTableNav}
            isMobile={isMobile}
            routeRefChangeTo={props.routeRefChangeTo ?? database}
          />
        )}
        <div className={css.rightContent}>
          <div className={css.main}>
            {!!showHeader &&
              (isMobile ? (
                <DatabaseTableHeaderMobile {...props} />
              ) : (
                <DatabaseTableHeader {...props} />
              ))}
            <KeyNav
              className={cx(css.rightContentScroller, {
                [css.maxWidth]: !useFullWidth,
                [css.noHeader]: !showHeader,
              })}
              mobileBreakpoint={1024}
            >
              {props.children}
            </KeyNav>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
