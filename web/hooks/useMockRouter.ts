import { NextRouter } from "next/router";

/*
Should be used to test components that use the `useRouter` hook from "next/router".

In the test file, need to include:

1. Jest spyOn (should be used as the router argument):
  `const jestRouter = jest.spyOn(require("next/router"), "useRouter");`

2. Jest mock:
  ```jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});```

The actions object can be used to test router methods. 
(i.e. `expect(actions.push).toHaveBeenCalled()`)
*/

type MockUseRouterParams = Partial<NextRouter>;

export const actions = {
  push: jest.fn(async () => Promise.resolve(true)),
  replace: jest.fn(async () => Promise.resolve(true)),
  reload: jest.fn(async () => Promise.resolve(true)),
  prefetch: jest.fn(async () => Promise.resolve()),
  back: jest.fn(async () => Promise.resolve(true)),
  beforePopState: jest.fn(async () => Promise.resolve(true)),
  events: {
    on: jest.fn(async () => Promise.resolve(true)),
    off: jest.fn(async () => Promise.resolve(true)),
  },
};

export default function useMockRouter(
  router: jest.SpyInstance<any, unknown[]>,
  {
    route = "",
    pathname = "",
    query = {},
    asPath = "",
    basePath = "",
    locale = "",
    locales = [],
    defaultLocale = "",
  }: MockUseRouterParams,
): jest.SpyInstance<any, unknown[]> {
  return router.mockImplementation(() => {
    return {
      route,
      pathname,
      query,
      asPath,
      basePath,
      locale,
      locales,
      defaultLocale,
      ...actions,
    };
  });
}
