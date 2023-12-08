export function notDoltError(action: string): Error {
  return new Error(`Cannot ${action} on non-Dolt database`);
}
