export const ROW_LIMIT = 50;

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
    if (err.message.includes("table not found")) {
      return undefined;
    }
    throw err;
  }
}
