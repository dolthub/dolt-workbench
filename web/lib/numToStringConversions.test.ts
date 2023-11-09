import {
  numToRoundedUsdWithCommas,
  numToStringWithCommas,
  numToUsdWithCommas,
} from "./numToStringConversions";

describe("test numToStringWithCommas util function", () => {
  it("formats whole numbers correctly", () => {
    expect(numToStringWithCommas(0)).toEqual("0");
    expect(numToStringWithCommas(5)).toEqual("5");
    expect(numToStringWithCommas(600)).toEqual("600");
    expect(numToStringWithCommas(140045)).toEqual("140,045");
  });
  it("formats numbers with decimals", () => {
    expect(numToStringWithCommas(0.0)).toEqual("0");
    expect(numToStringWithCommas(5.1)).toEqual("5.1");
    expect(numToStringWithCommas(600.009)).toEqual("600.009");
    expect(numToStringWithCommas(140045.994)).toEqual("140,045.994");
  });
});

describe("test numToUsdWithCommas util function", () => {
  it("formats whole numbers correctly", () => {
    expect(numToUsdWithCommas(0)).toEqual("$0.00");
    expect(numToUsdWithCommas(5)).toEqual("$5.00");
    expect(numToUsdWithCommas(600)).toEqual("$600.00");
    expect(numToUsdWithCommas(140045)).toEqual("$140,045.00");
  });
  it("formats numbers with decimals correctly", () => {
    expect(numToUsdWithCommas(0.0)).toEqual("$0.00");
    expect(numToUsdWithCommas(5.1)).toEqual("$5.10");
    expect(numToUsdWithCommas(600.009)).toEqual("$600.01");
    expect(numToUsdWithCommas(140045.994)).toEqual("$140,045.99");
  });

  describe("test numToRoundedUsdWithCommas util function", () => {
    it("formats whole numbers correctly", () => {
      expect(numToRoundedUsdWithCommas(0)).toEqual("$0");
      expect(numToRoundedUsdWithCommas(5)).toEqual("$5");
      expect(numToRoundedUsdWithCommas(600)).toEqual("$600");
      expect(numToRoundedUsdWithCommas(140045)).toEqual("$140,045");
    });
    it("formats numbers with decimals correctly", () => {
      expect(numToRoundedUsdWithCommas(0.0)).toEqual("$0");
      expect(numToRoundedUsdWithCommas(5.1)).toEqual("$5");
      expect(numToRoundedUsdWithCommas(600.009)).toEqual("$600");
      expect(numToRoundedUsdWithCommas(140045.994)).toEqual("$140,046");
    });
  });
});
