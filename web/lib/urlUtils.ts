import { ParsedUrlQueryInput } from "querystring";
import { UrlObject } from "url";

type Url = string | UrlObject;

export type LinkObject = {
  href: Url;
  as?: Url;
};

/**
 * __Route__
 *
 * `Route` class that handles adding static and dynamic route segments to
 * existing routes. `Route` can be initialized with a "href" string or
 * `UrlObject` and optional "as" string or `UrlObject`.
 *
 * @example
 * const routeA = new Route("/repositories");
 * routeA.hrefPathname() // "/repositories"
 * routeA.addDynamic("ownerName", "my-owner")
 * routeA.hrefPathname() // "repositories/[ownerName]"
 * routeA.asPathname() // "repositories/my-owner"
 *
 * const routeB = new Route(
 *   { pathname: "/repositories/[ownerName]", query: { refName: "main" } },
 *   { pathname: "/repositories/my-owner", query: { refName: "main" } },
 * )
 * routeB.hrefPathname() // "/repositories/[ownerName]"
 * routeB.asPathname() // "repositories/my-owner"
 * routeB.getQuery() // { refName: "main" }
 */
export class Route {
  href: Url;

  as: Url;

  constructor(href: Url, as?: Url) {
    this.href = href;
    this.as = as ?? href;
  }

  /**
   * __hrefPathname__
   *
   * Gets pathname string from href string or `UrlObject`.
   *
   * @param addFrag Optional route fragment string to add to `href` pathname
   *
   * @returns `href` pathname string, with added route fragment if provided
   *
   * @example
   * const routeA = new Route("/repositories");
   * routeA.hrefPathname() // "/repositories"
   * routeA.hrefPathname("[ownerName]") // "repositories/[ownerName]"
   *
   * const routeB = new Route({ pathname: "/repositories" })
   * routeB.hrefPathname() // "/repositories"
   * routeB.hrefPathname("[ownerName]") // "repositories/[ownerName]"
   */
  hrefPathname(addFrag?: string): string {
    const href = getPathname(this.href);
    if (!addFrag) return href;
    return `${href}/${addFrag}`;
  }

  /**
   *  __asPathname__
   *
   * Gets pathname string from as string or `UrlObject`.
   *
   * @param addFrag Optional route fragment string to add to `as` pathname
   *
   * @returns `as` pathname string, with added route fragment if provided
   *
   * @example
   * const routeA = new Route("/repositories");
   * routeA.asPathname() // "/repositories"
   * routeA.asPathname("my-username") // "repositories/my-username"
   *
   * const routeB = new Route(
   *   { pathname: "/repositories/[ownerName]" },
   *   { pathname: "/repositories/my-username" },
   * );
   * routeB.asPathname() // "/repositories/my-username"
   * routeB.asPathname("data") // "repositories/my-username/data"
   */
  asPathname(addFrag?: string): string {
    const as = getPathname(this.as);
    if (!addFrag) return as;
    return `${as}/${addFrag}`;
  }

  /**
   * __getQuery__
   *
   * Gets query object from the href `UrlObject`.
   *
   * @returns query object
   *
   * @example
   * const route = new Route("/repositories");
   * route.withQuery({ refName: "main" })
   * route.getQuery() // { refName: "main" }
   */
  getQuery(): string | ParsedUrlQueryInput | undefined | null {
    if (typeof this.href === "string") return undefined;
    return this.href.query;
  }

  /**
   * __getHash__
   *
   * Gets hash string from the href `UrlObject`.
   *
   * @returns hash string
   *
   * @example
   * const route = new Route("/repositories");
   * route.withHash("commitA")
   * route.getHash() // "commitA"
   */
  getHash(): string {
    if (typeof this.href === "string") return "";
    return this.href.hash ?? "";
  }

  /**
   * __addStatic__
   *
   * Adds static route fragment string to a `Route`. Static route fragments look like:
   * ```ts
   * { href: "/repositories", as: "/repositories" }
   * ```
   * As opposed to dynamic route fragments which look like:
   * ```ts
   * { href: "/[ownerName]", as: "/owner-value" }
   * ```
   *
   * @param pathFrag Route fragment string to add to the url. "/" is automatically prepended.
   *
   * @returns new instance of `Route`
   *
   * @example
   * const route = new Route("/repositories");
   * route.addStatic("data")
   * route.hrefPathname() // "/repositories/data"
   * route.asPathname() // "/repositories/data"
   */
  addStatic(pathFrag: string): Route {
    return new Route(this.hrefPathname(pathFrag), this.asPathname(pathFrag));
  }

  /**
   * __maybeAddStatic__
   *
   * Maybe adds static route fragment string to a `Route`.
   *
   * @see this.addStatic
   *
   * @param pathFrag Optional route fragment string to add to the url. "/" is automatically prepended.
   *
   * @example
   * const route = new Route("/repositories");
   * route.maybeAddStatic("data")
   * route.hrefPathname() // "/repositories/data"
   * route.maybeAddStatic()
   * route.hrefPathname() // "/repositories"
   */
  maybeAddStatic(pathFrag?: string): Route {
    return new Route(this.hrefPathname(pathFrag), this.asPathname(pathFrag));
  }

  /**
   * __addDynamic__
   *
   * Adds dynamic route fragment string to a Route.
   * Dynamic route fragments look like:
   * ```ts
   * { href: "/[ownerName]", as: "/owner-value" }
   * ```
   * As opposed to static route fragments which look like:
   *
   * ```ts
   * { href: "/repositories", as: "/repositories" }
   * ```
   *
   * @param param String fragment to add to the href path. This value will be wrapped in square brackets. "/" is automatically prepended.
   * @param as Value of the `param` to be added to the `as` path. "/" is automatically prepended.
   * @param encode Default false. If true, encodes a `as` param value string as a valid component of a Uniform Resource Identifier (URI).
   *
   * @returns new instance of `Route`
   *
   * @example
   * const route = new Route("/repositories");
   * route.addDynamic("ownerName", "my-owner-name")
   * route.hrefPathname() // "/repositories/[ownerName]"
   * route.asPathname() // "/repositories/my-owner-name"
   */
  addDynamic(param: string, as: string, encode = false): Route {
    const asStr = encode ? encodeURIComponent(as) : as;
    return new Route(this.hrefPathname(`[${param}]`), this.asPathname(asStr));
  }

  /**
   * __withQuery__
   *
   * Adds query object to a `Route`. Looks like "?refName=main&active=Tables"
   * when url is formatted.
   *
   * @param q Record with fields that will be added to the query string.
   *
   * @returns new instance of `Route`
   *
   * @example
   * const route = new Route("/repositories/[ownerName]", "/repositories/my-owner");
   * route.withQuery({ refName: "main", active: undefined })
   * route.hrefPathname() // { pathname: "/repositories/[ownerName]", query: { refName: "main" } }
   * route.asPathname() // { pathname: "/repositories/my-owner", query: { refName: "main" } }
   */
  withQuery(q: Record<string, string | undefined | null>): Route {
    const query = queryHandler(q);
    return new Route(
      { pathname: this.hrefPathname(), query },
      { pathname: this.asPathname(), query },
    );
  }

  /**
   * __withHash__
   *
   * Adds hash string to a `Route`. Looks like "#hash-value" when url is formatted.
   *
   * @param hash Optional hash string
   *
   * @returns new instance of Route
   *
   * @example
   * const route = new Route("/repositories/[ownerName]", "/repositories/my-owner");
   * route.withHash({ commitId: "commitA" })
   * route.hrefPathname() // { pathname: "/repositories/[ownerName]", hash: { commitId: "commitA" } }
   * route.asPathname() // { pathname: "/repositories/my-owner", hash: { commitId: "commitA" } }
   */
  withHash(hash?: string): Route {
    return new Route(
      { pathname: this.hrefPathname(), hash },
      { pathname: this.asPathname(), hash },
    );
  }
}

// Gets pathname from url string or object
function getPathname(as?: string | UrlObject): string {
  if (!as) return "";
  if (typeof as === "string") return as;
  return as.pathname ?? "";
}

// Returns query object with undefined or empty values removed
export function queryHandler(
  q: Record<string, string | undefined | null>,
): string | null | ParsedUrlQueryInput | undefined {
  return Object.keys(q).reduce((prev, key) => {
    const currVal = q[key];
    if (currVal !== undefined && currVal !== null && currVal.length > 0) {
      return { ...prev, [key]: currVal };
    }
    return prev;
  }, {} as NodeJS.Dict<string>);
}
