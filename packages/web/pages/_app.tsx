import "@components/util/KeyNav/index.css";
import { withApollo } from "@lib/apollo";
// import "github-markdown-css/github-markdown-light.css";
import App from "next/app";
import Head from "next/head";
// import "react-tooltip/dist/react-tooltip.css";
import "../styles/global.css";

export default class DoltSQLWorkbench extends App {
  public render() {
    const { Component, pageProps, router } = this.props;

    // this.props.pageProps are the initial props fetched on a server side render.
    // The following keeps the pageProps updated with the client navigation.
    // This is necessary for pages that call getServerSideProps AND are routed to from within the app (i.e. router.push()).
    pageProps.params = {
      ...router.query,
    };

    const WrappedPage = withApollo()(Component);
    return (
      <>
        <Head>
          {/* <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link
            rel="mask-icon"
            href="/favicon/safari-pinned-tab.svg"
            color="#5bbad5"
          /> */}
          <link rel="icon" href="/favicon.ico" />
          <meta name="msapplication-TileColor" content="#2b5797" />
          <meta name="theme-color" content="#182134" />
        </Head>
        <WrappedPage {...pageProps} />
      </>
    );
  }
}
