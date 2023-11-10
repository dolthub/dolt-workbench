export default function nTimes<T>(
  n: number,
  operation: (...args: any[]) => T,
  args: Parameters<typeof operation> = [],
): T[] {
  const collection = [];
  for (let i = 0; i < n; i++) {
    collection.push(operation(...args));
  }
  return collection;
}

export function nTimesWithIndex<T>(n: number, operation: (n: number) => T) {
  const collection = [];
  for (let i = 0; i < n; i++) {
    collection.push(operation(i));
  }
  return collection;
}
