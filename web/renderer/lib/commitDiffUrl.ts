import { CommitDiffType } from "@gen/graphql-types";
import { ParsedUrlQuery } from "querystring";

export type CommitDiffContext = {
  tableName: string;
  schemaName?: string;
  fromCommitId: string;
  toCommitId: string;
  excludedColumns: string[];
  type?: CommitDiffType;
};

const KEYS = {
  table: "commitDiffTable",
  schema: "commitDiffSchema",
  from: "commitDiffFrom",
  to: "commitDiffTo",
  exclude: "commitDiffExclude",
  type: "commitDiffType",
} as const;

export type CommitDiffQuery = {
  [KEYS.table]?: string;
  [KEYS.schema]?: string;
  [KEYS.from]?: string;
  [KEYS.to]?: string;
  [KEYS.exclude]?: string[];
  [KEYS.type]?: string;
};

export function encodeCommitDiff(ctx: CommitDiffContext): CommitDiffQuery {
  return {
    [KEYS.table]: ctx.tableName,
    [KEYS.schema]: ctx.schemaName,
    [KEYS.from]: ctx.fromCommitId,
    [KEYS.to]: ctx.toCommitId,
    [KEYS.exclude]:
      ctx.excludedColumns.length > 0 ? ctx.excludedColumns : undefined,
    [KEYS.type]: ctx.type,
  };
}

export function parseCommitDiff(
  q: ParsedUrlQuery,
): CommitDiffContext | undefined {
  const tableName = strParam(q[KEYS.table]);
  const fromCommitId = strParam(q[KEYS.from]);
  const toCommitId = strParam(q[KEYS.to]);
  if (!tableName || !fromCommitId || !toCommitId) return undefined;
  return {
    tableName,
    schemaName: strParam(q[KEYS.schema]),
    fromCommitId,
    toCommitId,
    excludedColumns: listParam(q[KEYS.exclude]),
    type: parseType(q[KEYS.type]),
  };
}

function parseType(
  raw: string | string[] | undefined,
): CommitDiffType | undefined {
  if (typeof raw !== "string") return undefined;
  if (raw === CommitDiffType.TwoDot) return CommitDiffType.TwoDot;
  if (raw === CommitDiffType.ThreeDot) return CommitDiffType.ThreeDot;
  return undefined;
}

function strParam(raw: string | string[] | undefined): string | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  return raw;
}

function listParam(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter(s => s.length > 0);
}
