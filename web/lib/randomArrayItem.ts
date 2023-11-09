export default function randomArrayItem<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Can't take random element of empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
