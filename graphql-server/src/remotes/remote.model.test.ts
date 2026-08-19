import { fromDoltRemotesRow } from "./remote.model";

describe("fromDoltRemotesRow", () => {
  const fetchSpec = "refs/heads/*:refs/remotes/origin/*";

  test("preserves fetch specs returned as an array", () => {
    expect(
      fromDoltRemotesRow("my_database", {
        name: "origin",
        url: "https://example.com/owner/database",
        fetch_specs: [fetchSpec],
      }).fetchSpecs,
    ).toEqual([fetchSpec]);
  });

  test("parses DoltLite fetch specs returned as JSON text", () => {
    expect(
      fromDoltRemotesRow("my_database", {
        name: "origin",
        url: "https://example.com/owner/database",
        fetch_specs: JSON.stringify([fetchSpec]),
      }).fetchSpecs,
    ).toEqual([fetchSpec]);
  });

  test("omits invalid fetch specs instead of violating the GraphQL type", () => {
    expect(
      fromDoltRemotesRow("my_database", {
        name: "origin",
        url: "https://example.com/owner/database",
        fetch_specs: "not-json",
      }).fetchSpecs,
    ).toBeUndefined();
  });
});
