import { Route } from "@dolthub/web-utils";
import { OptionalRefParams } from "@lib/params";
import {
  commitLog,
  database,
  DatabaseUrl,
  defaultDoc,
  pulls,
  ref,
  RefUrl,
  releases,
  remotes,
  tests,
} from "@lib/urls";

function getUrlFromName(name: string): [DatabaseUrl, RefUrl?] {
  switch (name) {
    case "Database":
      return [database, ref];
    case "About":
      return [database, defaultDoc];
    case "Commit Log":
      return [database, commitLog];
    case "Releases":
      return [releases];
    case "Pull Requests":
      return [pulls];
    case "Remotes":
      return [remotes];
    case "Tests":
      return [database, tests];
    default:
      return [database, ref];
  }
}

export function getUrlForRefName(
  params: OptionalRefParams,
  name: string,
): Route {
  const [emptyUrl, url] = getUrlFromName(name);

  if (!params.refName) return emptyUrl(params);
  if (url) return url({ ...params, refName: params.refName });
  return emptyUrl(params);
}
