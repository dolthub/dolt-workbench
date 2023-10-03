import { RefParams } from "@lib/params";
import { database, ref } from "@lib/urls";
import { Route } from "@lib/urlUtils";

export type RefUrl = (p: RefParams) => Route;
type DatabaseUrl = () => Route;

function getUrlFromName(name: string): [DatabaseUrl, RefUrl?] {
  switch (name) {
    case "Database":
      return [database, ref];
    // case "About":
    //   return [defaultDocDefaultBranch, defaultDoc];
    // case "Commit Log":
    //   return [database, commitLog];
    // case "Releases":
    //   return [releases];
    // case "Pull Requests":
    //   return [pulls];
    default:
      return [database, ref];
  }
}

export function getUrlForRefName(
  params: { refName?: string },
  name: string,
): Route {
  const [emptyUrl, url] = getUrlFromName(name);

  if (!params.refName) return emptyUrl();
  if (url) return url({ refName: params.refName });
  return emptyUrl();
}
