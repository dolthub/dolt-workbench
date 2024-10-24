import { BreadcrumbDetails, BreadcrumbProps } from "./types";

export function getBreadcrumbProps(b: BreadcrumbDetails): BreadcrumbProps {
  return {
    key: `${b.name}-${b.type}`,
    "data-cy": `${b.name}-breadcrumb-${b.type}`,
    "aria-label": `${b.name}-breadcrumb-${b.type}`,
  };
}

export function getDiffRangeFromString(
  s: string,
  r?: string | string[],
): string {
  if (!r) return s;
  const dr = Array.isArray(r) ? r[0] : r;
  const [to, from] = dr.split("..");
  if (from) {
    return `${to.slice(0, 7)}..${from.slice(0, 7)}`;
  }
  return dr.slice(0, 7);
}
