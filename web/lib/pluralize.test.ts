import { pluralize } from "./pluralize";

describe("test pluralize", () => {
  it("pluralizes words", () => {
    expect(pluralize(1, "test")).toEqual("test");
    expect(pluralize(2, "test")).toEqual("tests");
    expect(pluralize(3, "person")).toEqual("people");
    expect(pluralize(0, "repository")).toEqual("repositories");
    expect(pluralize(0, "database updated today")).toEqual(
      "databases updated today",
    );
    expect(pluralize(10, "database updated today")).toEqual(
      "databases updated today",
    );
  });
});
