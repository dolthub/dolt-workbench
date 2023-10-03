import { OptionalRefParams } from "./params";
import { ref } from "./urls";

export function getDatabasePageName(title?: string): string {
  if (!title) {
    return "ref";
  }
  const lower = title.toLocaleLowerCase();
  // if (lower.includes("pull")) {
  //   return "pulls";
  // }
  if (lower.includes("ref")) {
    return "ref";
  }
  // if (lower.includes("commitlog") || lower.includes("commitdiff")) {
  //   return "commitLog";
  // }
  // if (lower.includes("releases")) {
  //   return "releases";
  // }
  return "about";
}

export function getDatabasePageRedirectInfo(
  pageName: string,
  params: OptionalRefParams,
) {
  // if (pageName === "about") {
  //   return defaultDocDefaultBranch(params);
  // }
  // if (pageName.includes("pull")) {
  //   return pulls(params);
  // }
  if (!pageName || pageName.includes("ref")) {
    return ref({ ...params, refName: params.refName ?? "" });
  }
  // if (pageName.includes("commitLog")) {
  //   return commitLog({ ...params, refName: params.refName ?? "" });
  // }
  // if (pageName.includes("releases")) {
  //   return releases(params);
  // }
  return ref({ ...params, refName: params.refName ?? "" });
}
