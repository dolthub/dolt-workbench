import { RowForSchemasFragment } from "@gen/graphql-types";

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
  rows?: RowForSchemasFragment[],
): string[] {
  if (!rows) return [];
  return rows
    .filter(v => v.columnValues[0].displayValue === kind)
    .map(e => e.columnValues[1].displayValue);
}
