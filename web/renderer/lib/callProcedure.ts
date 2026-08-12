export function callProcedure(
  isPostgres: boolean,
  name: string,
  args: string[],
): string {
  const quote = isPostgres
    ? (s: string) => s.replace(/'/g, "''")
    : (s: string) => s.replace(/'/g, "\\'");
  const quotedArgs = args.map(a => `'${quote(a)}'`).join(", ");
  return `${isPostgres ? "SELECT" : "CALL"} ${name}(${quotedArgs});`;
}
