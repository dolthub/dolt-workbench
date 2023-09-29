import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { IncomingMessage } from "http";
import fetch from "isomorphic-unfetch";
import { NextPage, NextPageContext } from "next";

// const {
//   publicRuntimeConfig: { graphqlApiUrl },
// } = getConfig();
const graphqlApiUrl = "http://localhost:9002/graphql";

export function createApolloClient(
  uri: string,
  initialState?: NormalizedCacheObject,
  req?: IncomingMessage,
): ApolloClient<NormalizedCacheObject> {
  // const extaddress = req?.headers["x-envoy-external-address"];
  // const useragent = req?.headers["x-hosted-external-user-agent"];
  // const reqid = req?.headers["x-request-id"];

  const headers: Record<string, string> = {
    "Apollo-Require-Preflight": "true",
    cookie: req?.headers.cookie ?? "",
    // ...(extaddress
    //   ? {
    //       "x-envoy-external-address": Array.isArray(extaddress)
    //         ? extaddress[0]
    //         : extaddress,
    //     }
    //   : {}),
    // ...(useragent
    //   ? {
    //       "x-hosted-external-user-agent": Array.isArray(useragent)
    //         ? useragent[0]
    //         : useragent,
    //     }
    //   : {}),
    // ...(reqid
    //   ? { "x-request-id": Array.isArray(reqid) ? reqid[0] : reqid }
    //   : {}),
  };

  const cache = new InMemoryCache({
    // possibleTypes: fragmentTypes.possibleTypes,
  }).restore(initialState || {});

  return new ApolloClient({
    cache,
    link: new HttpLink({
      fetch,
      credentials: "include",
      uri,
      headers,
    }),
  });
}

// On the client, we store the Apollo Client in the following variable.
// This prevents the client from reinitializing between page transitions.
let globalApolloClient: ApolloClient<NormalizedCacheObject> | undefined;

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {NormalizedCacheObject} initialState
 * @param  {IncomingMessage} req
 */
export const initApolloClient = (
  initialState?: NormalizedCacheObject,
  req?: IncomingMessage,
): ApolloClient<NormalizedCacheObject> => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.INTERNAL_GRAPHQLAPI_URL!,
      initialState,
      req,
    );
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(
      graphqlApiUrl ?? "",
      initialState,
      req,
    );
  }

  return globalApolloClient;
};

type ApolloContext = {
  apolloClient?: ApolloClient<NormalizedCacheObject>;
  apolloState?: NormalizedCacheObject;
};

type ContextWithClient = NextPageContext & ApolloContext;

/**
 * Installs the Apollo Client on NextPageContext
 * Useful if you want to use apolloClient
 * inside getStaticProps, getStaticPaths or getServerSideProps
 * @param {NextPageContext | NextAppContext} ctx
 */
export const initOnContext = (ctx: NextPageContext): ContextWithClient => {
  const newCtx: ContextWithClient = ctx;
  // Initialize ApolloClient if not already done
  const apolloClient =
    newCtx.apolloClient ?? initApolloClient(newCtx.apolloState ?? {}, ctx.req);

  // We send the Apollo Client as a prop to the component to avoid calling initApollo() twice in the server.
  // Otherwise, the component would have to call initApollo() again but this
  // time without the context. Once that happens, the following code will make sure we send
  // the prop as `null` to the browser.
  (apolloClient as any).toJSON = () => null;

  // Add apolloClient to NextPageContext.
  newCtx.apolloClient = apolloClient;
  return newCtx;
};

/**
 * Creates a withApollo HOC
 * that provides the apolloContext
 * to a next.js Page or AppTree.
 * @returns {(PageComponent: ReactNode) => ReactNode}
 */
export function withApollo<
  P extends Record<string, unknown> = Record<string, unknown>,
>() {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return (PageComponent: NextPage<P>) => {
    const WithApollo = ({
      apolloClient,
      apolloState,
      ...pageProps
    }: ApolloContext) => {
      let client: ApolloClient<NormalizedCacheObject>;
      if (apolloClient) {
        // Happens on: getDataFromTree & next.js ssr
        client = apolloClient;
      } else {
        // Happens on: next.js csr
        client = initApolloClient(apolloState, undefined);
      }
      return (
        <ApolloProvider client={client}>
          <PageComponent {...(pageProps as P)} />
        </ApolloProvider>
      );
    };
    // Set the correct displayName in development
    if (process.env.NODE_ENV !== "production") {
      const displayName =
        (PageComponent.displayName ?? PageComponent.name) || "Component";
      WithApollo.displayName = `withApollo(${displayName})`;
    }

    return WithApollo;
  };
}
