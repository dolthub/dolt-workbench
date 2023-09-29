export function tableIsActive(tableName: string, q?: string): boolean {
  if (!q) return false;
  const qf = q.toLowerCase().trim();
  const text = "show create table";
  const tn = tableName.toLowerCase();
  return qf === `${text} ${tn}` || qf === `${text} \`${tn}\``;
}

export function getActiveTable(q?: string): string | undefined {
  if (!q) return undefined;
  const table = q.replace(/show create table /gi, "");
  return table.replaceAll("`", "");
}
