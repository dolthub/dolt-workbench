import { convertRowDate } from ".";

describe("convertRowDate", () => {
  it("parses DoltLite's UTC datetime strings", () => {
    const d = convertRowDate("2026-08-11 20:48:56");
    expect(d.toISOString()).toEqual("2026-08-11T20:48:56.000Z");
  });

  it("passes Date objects through UTC conversion", () => {
    const d = convertRowDate(new Date("2026-08-11T20:48:56.000Z"));
    expect(d).toBeInstanceOf(Date);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });
});
