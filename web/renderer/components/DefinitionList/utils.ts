import { SchemaItemFragment, SchemaType } from "@gen/graphql-types";

export function getActiveItem(
  kind: SchemaType,
  q?: string,
  isPostgres?: boolean,
): string | undefined {
  if (!q) return undefined;
  if (isPostgres) {
    switch (kind) {
      case SchemaType.Table:
        return getItemNameFromPostgresQuery(
          q,
          /SELECT .* FROM information_schema.columns WHERE( table_schema = '.*' AND)? table_name = /gi,
        );

      case SchemaType.View:
        return q
          .replace(/SELECT pg_get_viewdef\(/gi, "")
          .replace(/, true\)/gi, "")
          .replaceAll("'", "");

      case SchemaType.Trigger:
        return getItemNameFromPostgresQuery(
          q,
          /SELECT pg_get_triggerdef\(oid\) from pg_trigger where tgname = /gi,
        );

      case SchemaType.Event:
        return getItemNameFromPostgresQuery(
          q,
          /SELECT \* FROM pg_event_trigger WHERE evtname = /gi,
        );

      case SchemaType.Procedure:
        return getItemNameFromPostgresQuery(
          q,
          /SELECT pg_get_functiondef\(oid\) from pg_proc where proname = /gi,
        );
      default:
        return "";
    }
  }
  const item = q
    .toLowerCase()
    .replace(`show create ${kind.toLowerCase()} `, "");
  return item.replaceAll("`", "");
}

function getItemNameFromPostgresQuery(q: string, reg: RegExp): string {
  return q.replace(reg, "").replaceAll("'", "");
}

export function getDefItemsFromRows(
  kind: SchemaType,
  items?: SchemaItemFragment[],
): string[] {
  if (!items) return [];
  return items.filter(i => i.type === kind).map(i => i.name);
}
