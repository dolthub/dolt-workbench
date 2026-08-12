import { SchemaType } from "@gen/graphql-types";
import { fragIdxFor } from ".";

describe("fragIdxFor", () => {
  it("returns 0 for every kind on postgres", () => {
    Object.values(SchemaType).forEach(kind => {
      expect(fragIdxFor(kind, true)).toBe(0);
    });
  });

  it("returns the SHOW CREATE statement index for each kind on mysql", () => {
    expect(fragIdxFor(SchemaType.Table, false)).toBe(1);
    expect(fragIdxFor(SchemaType.View, false)).toBe(1);
    expect(fragIdxFor(SchemaType.Trigger, false)).toBe(2);
    expect(fragIdxFor(SchemaType.Procedure, false)).toBe(2);
    expect(fragIdxFor(SchemaType.Event, false)).toBe(3);
  });
});
