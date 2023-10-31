import { SchemaItemFragment } from "@gen/graphql-types";

export type SchemaKind = "table" | "view" | "trigger" | "event" | "procedure";

export function getActiveItem(
  kind: SchemaKind,
  q?: string,
): string | undefined {
  if (!q) return undefined;
  const item = q.toLowerCase().replace(`show create ${kind} `, "");
  return item.replaceAll("`", "");
}

export function getSchemaItemsFromRows(
  kind: SchemaKind,
  items?: SchemaItemFragment[],
): string[] {
  if (!items) return [];
  return items.filter(i => i.type === kind).map(i => i.name);
}
