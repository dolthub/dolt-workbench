export function strParam(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  return raw;
}

export function listParam(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter(s => s.length > 0);
}
