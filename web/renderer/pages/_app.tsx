import "@components/AceEditor/ace-editor.css";
import "@components/util/KeyNav/index.css";
import GlobalAgentPanel from "@components/GlobalAgentPanel";
import { AgentProvider } from "@contexts/agent";
import { ServerConfigProvider, useServerConfig } from "@contexts/serverConfig";
import {
  ThemeProvider,
  workbenchTailwindColorTheme,
} from "@dolthub/react-components";
import { withApollo } from "@lib/apollo";
import "github-markdown-css/github-markdown-light.css";
import App from "next/app";
import { SWRConfig } from "swr";
import "../styles/global.css";
import { useEffect, useMemo } from "react";

// configure fetch for use with SWR
const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw await res.json();
  }
  return res.json();
};

function Inner(props: { pageProps: any; Component: any }) {
  const { graphqlApiUrl } = useServerConfig();
  const { params } = props.pageProps;
  const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

  useEffect(() => {
    if (isElectron) {
      // enable the tools when the database is selected
      window.ipc.updateAppMenu(params?.databaseName);
    }
  }, [props.pageProps, isElectron]);

  // Memoize the wrapped page component to prevent recreation on every render
  const WrappedPage = useMemo(
    () => withApollo(graphqlApiUrl)(props.Component),
    [graphqlApiUrl, props.Component],
  );

  return <WrappedPage {...props.pageProps} />;
}

export default class DoltSQLWorkbench extends App {
  public render() {
    const { Component, pageProps, router } = this.props;

    // this.props.pageProps are the initial props fetched on a server side render.
    // The following keeps the pageProps updated with the client navigation.
    // This is necessary for pages that call getServerSideProps AND are routed to from within the app (i.e. router.push()).
    pageProps.params = {
      ...router.query,
    };

    return (
      <SWRConfig value={{ fetcher }}>
        <ServerConfigProvider>
          <ThemeProvider themeRGBOverrides={workbenchTailwindColorTheme}>
            <AgentProvider>
              <Inner pageProps={pageProps} Component={Component} />
              <GlobalAgentPanel />
            </AgentProvider>
          </ThemeProvider>
        </ServerConfigProvider>
      </SWRConfig>
    );
  }
}
