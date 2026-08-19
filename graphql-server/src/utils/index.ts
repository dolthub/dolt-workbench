import { convertToUTCDate } from "@dolthub/web-utils";

export const ROW_LIMIT = 50;

// The MySQL and Postgres drivers return datetime columns as Date objects,
// while the DoltLite driver returns them as UTC strings.
export function convertRowDate(value: Date | string): Date {
  if (typeof value === "string") {
    return new Date(`${value.replace(" ", "T")}Z`);
  }
  return convertToUTCDate(value);
}

export function getNextOffset(
  rowLen: number,
  offset: number,
): number | undefined {
  return rowLen > ROW_LIMIT ? offset + ROW_LIMIT : undefined;
}

export async function handleTableNotFound<T>(
  q: () => Promise<T | undefined>,
): Promise<T | undefined> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (
      err.message.includes("table not found") ||
      err.message.includes("no such table")
    ) {
      return undefined;
    }
    throw err;
  }
}
