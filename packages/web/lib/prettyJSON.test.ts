import prettyJSON, { prettyJSONText } from "./prettyJSON";

const expected = `{
  "foo": "bar",
  "baz": {
    "boom": 123
  }
}`;

test("renders JSON in a readable format", () => {
  const data = { foo: "bar", baz: { boom: 123 } };
  expect(prettyJSON(data)).toBe(expected);
});

test("parses and renders JSON text in a readable format", () => {
  const data = `{ "foo": "bar", "baz": { "boom": 123 } }`;
  expect(prettyJSONText(data)).toBe(expected);
});

test("bad json returns original string", () => {
  const data = `{ "foo": bad, "baz": { "boom": 123 } }`;
  expect(prettyJSONText(data)).toBe(data);
});
