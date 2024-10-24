export function getSchemaInfo(q: string): { isView: boolean; fragIdx: number } {
  const lower = q.toLowerCase();
  if (lower.startsWith("show create view")) {
    return { isView: true, fragIdx: 1 };
  }
  if (
    lower.startsWith("show create trigger") ||
    lower.startsWith("show create procedure")
  ) {
    return { isView: false, fragIdx: 2 };
  }
  if (lower.startsWith("show create event")) {
    return { isView: false, fragIdx: 3 };
  }
  return { isView: false, fragIdx: 0 };
}
