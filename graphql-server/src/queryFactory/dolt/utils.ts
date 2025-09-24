import * as t from "../types";
import { TestIdentifierArgs } from "../types";

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

export function unionCols(a: t.RawRows, b: t.RawRows): t.RawRows {
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

export function getAuthorString(commitAuthor: t.CommitAuthor): string {
  return `${commitAuthor.name} <${commitAuthor.email}>`;
}

export function getTestIdentifierArg(
  testIdentifier: TestIdentifierArgs | undefined,
): string | undefined {
  if (testIdentifier?.testName) {
    return testIdentifier.testName;
  } else if (testIdentifier?.groupName) {
    return testIdentifier.groupName;
  } else {
    return undefined;
  }
}
