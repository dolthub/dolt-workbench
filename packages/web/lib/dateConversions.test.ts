import { getDateAndTimeString } from "./dateConversions";

const dateTests: Array<{
  date: Date;
  expectedDate: string;
}> = [
  {
    date: getDateAtTime(1, 2, 4, 30),
    expectedDate: "2022-01-02T04:30",
  },
  {
    date: getDateAtTime(9, 30, 22, 1),
    expectedDate: "2022-09-30T22:01",
  },
  {
    date: getDateAtTime(12, 31, 23, 58),
    expectedDate: "2022-12-31T23:58",
  },
];

describe("test date conversions", () => {
  dateTests.forEach(test => {
    it(`gets date and time string for ${test.date.toLocaleDateString()}`, () => {
      expect(getDateAndTimeString(test.date)).toEqual(test.expectedDate);
    });
  });
});

function getDateAtTime(
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  const date = new Date();
  // Months are 0 indexed
  date.setFullYear(2022, month - 1, day);
  date.setHours(hours, minutes);
  return date;
}
