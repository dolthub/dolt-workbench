import excerpt from "./excerpt";

test("does not modify a string shorter than the specified length", () => {
  expect(excerpt("shorter string", 100)).toBe("shorter string");
});

test("truncates an excerpt longer than the specified length", () => {
  expect(excerpt("there are 38 characters in this string", 30)).toBe(
    "there are 38 characters in th…",
  );
});
