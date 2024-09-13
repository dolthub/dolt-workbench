export function getBitDisplayValue(value: string): string {
  return value.charCodeAt(0).toString();
}

export function escapeDoubleQuotes(s: string): string {
  return s.replace(/"/g, `\\"`);
}

export function escapeSingleQuotes(s: string): string {
  return s.replace(/'/g, `\\'`);
}

export function isLongContentType(currentColType?: string): boolean {
  if (!currentColType) return false;
  const colType = currentColType.toLowerCase();
  return (
    (colType.includes("text") && colType !== "tinytext") ||
    ((colType.startsWith("varchar") || colType.includes("character")) &&
      parseInt(colType.split(/\(|\)/)[1], 10) >= 100) ||
    colType === "json" ||
    colType === "longblob"
  );
}

// Input: ENUM('option-1','option-2')
// Output: ['option-1', 'option-2']
export function splitEnumOptions(en: string): string[] {
  const firstPar = en.indexOf("(");
  const lastPar = en.indexOf(")");
  const middle = en.substring(firstPar + 1, lastPar);
  return middle.split(",").map(v => v.replace(/'/g, ""));
}
