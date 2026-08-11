import { SchemaType } from "@gen/graphql-types";
import { ParsedUrlQuery } from "querystring";

export type DefinitionContext = {
  name: string;
  kind: SchemaType;
  schemaName?: string;
};

const KEYS = {
  name: "definitionName",
  kind: "definitionKind",
  schema: "definitionSchema",
} as const;

export type DefinitionQuery = {
  [KEYS.name]?: string;
  [KEYS.kind]?: string;
  [KEYS.schema]?: string;
};

export function encodeDefinition(ctx: DefinitionContext): DefinitionQuery {
  return {
    [KEYS.name]: ctx.name,
    [KEYS.kind]: ctx.kind,
    [KEYS.schema]: ctx.schemaName,
  };
}

export function parseDefinition(
  q: ParsedUrlQuery,
): DefinitionContext | undefined {
  const name = strParam(q[KEYS.name]);
  const kind = parseKind(q[KEYS.kind]);
  if (!name || !kind) return undefined;
  return { name, kind, schemaName: strParam(q[KEYS.schema]) };
}

function parseKind(raw: string | string[] | undefined): SchemaType | undefined {
  if (typeof raw !== "string") return undefined;
  const values: SchemaType[] = Object.values(SchemaType);
  return values.find(v => v === raw);
}

function strParam(raw: string | string[] | undefined): string | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  return raw;
}
