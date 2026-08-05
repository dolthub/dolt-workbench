function readList(key: string): string[] {
  const item = window.sessionStorage.getItem(key);
  if (!item) return [];
  try {
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function prepend(key: string, query: string): void {
  const list = readList(key);
  if (list[0] === query) return;
  window.sessionStorage.setItem(key, JSON.stringify([query, ...list]));
}

export function getQueryHistory(databaseName: string): string[] {
  if (typeof window === "undefined") return [];
  return readList(`query-history-${databaseName}`);
}

export function recordQuery(databaseName: string, query?: string): void {
  if (!query || typeof window === "undefined") return;
  prepend(`query-history-${databaseName}`, query);
}

export function recordMutation(databaseName: string, query?: string): void {
  if (!query || typeof window === "undefined") return;
  prepend(`mutation-history-${databaseName}`, query);
  prepend(`query-history-${databaseName}`, query);
}
