import { SchemaItemFragment, SchemaType } from "@gen/graphql-types";
import { parseDefinition } from "@lib/definitionUrl";
import { ParsedUrlQuery } from "querystring";

export function getActiveItem(
  kind: SchemaType,
  query: ParsedUrlQuery,
): string | undefined {
  const ctx = parseDefinition(query);
  if (!ctx || ctx.kind !== kind) return undefined;
  return ctx.name;
}

export function getDefItemsFromRows(
  kind: SchemaType,
  items?: SchemaItemFragment[],
): string[] {
  if (!items) return [];
  return items.filter(i => i.type === kind).map(i => i.name);
}
