import nTimes, { nTimesWithIndex } from "./nTimes";

test("it collects results of doing an operation a given number of times with given args", () => {
  const operation = (n: number) => n + 5;
  const args = [5];
  const tenTens = nTimes(10, operation, args);
  expect(tenTens.length).toBe(10);
  expect(tenTens.every(t => t === 10));
});

test("withIndex collects results of doing an operation a given number of times with the index number as an argument", () => {
  const operation = (n: number) => `string ${n}`;
  expect(nTimesWithIndex(5, operation)).toEqual([
    "string 0",
    "string 1",
    "string 2",
    "string 3",
    "string 4"
  ]);
});
