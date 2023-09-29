// Using an unprintable string for null values so we can distinguish between
// string "null" and null
export const NULL_VALUE = "\uf5f2\ueb94NULL\uf5a8\ue6ff";

export function isNullValue(dv: string): boolean {
  return dv === NULL_VALUE;
}

export function getDisplayValue(dv: string): string {
  return isNullValue(dv) ? "NULL" : dv;
}

export function getDisplayValueForApi(dv: string): string | null {
  return isNullValue(dv) ? null : dv;
}
