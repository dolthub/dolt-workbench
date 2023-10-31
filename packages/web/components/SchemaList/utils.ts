import { SchemaItemFragment, SchemaType } from "@gen/graphql-types";

export function getActiveItem(
  kind: SchemaType,
  q?: string,
): string | undefined {
  if (!q) return undefined;
  const item = q
    .toLowerCase()
    .replace(`show create ${kind.toLowerCase()} `, "");
  return item.replaceAll("`", "");
}

export function getSchemaItemsFromRows(
  kind: SchemaType,
  items?: SchemaItemFragment[],
): string[] {
  if (!items) return [];
  return items.filter(i => i.type === kind).map(i => i.name);
}
