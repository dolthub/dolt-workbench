import nTimes from "./nTimes";
import randomArrayItem from "./randomArrayItem";

test("it returns an item from the array", () => {
  const items = [1, 2, 3, 4, 5];
  nTimes(10, () => expect(items).toContain(randomArrayItem(items)));
});

test("it throws when the passed array is empty", () => {
  expect(() => randomArrayItem([])).toThrow();
});
