import { RawRows } from "../types";

export async function handleRefNotFound<T>(q: () => Promise<T>): Promise<T> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (err.message.includes("invalid ref spec")) {
      throw new Error("no such ref in database");
    }
    throw err;
  }
}

export function unionCols(a: RawRows, b: RawRows): RawRows {
  const mergedArray = [...a, ...b];
  const set = new Set();
  const unionArray = mergedArray.filter(item => {
    if (!set.has(item.Field)) {
      set.add(item.Field);
      return true;
    }
    return false;
  }, set);
  return unionArray;
}
