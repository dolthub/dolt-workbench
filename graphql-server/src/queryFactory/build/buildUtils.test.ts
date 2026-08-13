import { escapeIdentifier } from "./buildUtils";

describe("escapeIdentifier", () => {
  it("double-quotes identifiers and escapes embedded quotes", () => {
    expect(escapeIdentifier('dolt_diff_weird"table')).toEqual(
      '"dolt_diff_weird""table"',
    );
  });
});
