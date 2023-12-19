import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { ColumnValue } from "@hooks/useSqlBuilder/util";
import { getDateString, getTimeWithSeconds } from "@lib/dateConversions";
import { loremer } from "@lib/loremer";
import nTimes from "@lib/nTimes";

export function mapColTypeToFakeValue(
  col: ColumnForDataTableFragment,
): ColumnValue {
  const lower = col.type.toLowerCase();
  if (lower.includes("int")) {
    return { type: "number", value: getFakeInt(col.type) };
  }
  if (
    lower.includes("decimal") ||
    lower.includes("float") ||
    lower.includes("double")
  ) {
    return {
      type: "number",
      value: Number(
        `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 100)}`,
      ),
    };
  }
  if (lower.includes("year")) {
    const currYear = new Date(Date.now()).getFullYear();
    return { type: "number", value: getRandomNumFromRange(1900, currYear) };
  }
  if (lower.includes("date") || lower.includes("time")) {
    return { type: "single_quote_string", value: getRandomDateOrTime(lower) };
  }
  if (lower.includes("char") || lower.includes("text")) {
    return { type: "single_quote_string", value: getRandomText(lower) };
  }
  if (lower.includes("json")) {
    return { type: "single_quote_string", value: getRandomJSON() };
  }
  if (lower === "blob" || lower === "longblob") {
    return { type: "single_quote_string", value: `blob` };
  }
  return { type: "single_quote_string", value: "text" };
}

export function getFakeInt(type: string): number {
  return Math.floor(Math.random() * getIntMultiplier(type));
}

function getRandomJSON(): string {
  const array = `[${nTimes(3, () => getFakeInt("smallint")).join(",")}]`;
  return `{"${loremer.word()}":"${loremer.sentence()}","${loremer.word()}":${array}}`;
}

// Uses max value signed https://dev.mysql.com/doc/refman/8.0/en/integer-types.html
function getIntMultiplier(type: string): number {
  const lower = type.toLowerCase();
  if (lower.startsWith("big")) {
    return 2 ** 62;
  }
  if (lower.startsWith("medium")) {
    return 8388607;
  }
  if (lower.startsWith("small")) {
    return 32767;
  }
  if (lower.startsWith("tiny")) {
    return 127;
  }
  return 2147483647;
}

export function getRandomDateOrTime(lowerType: string): string {
  const ranDate = getRandomDate();
  const date = getDateString(ranDate);
  const time = getTimeWithSeconds(ranDate);
  if (lowerType === "time") {
    return time;
  }
  if (lowerType === "date") {
    return date;
  }
  if (lowerType === "datetime" || lowerType === "timestamp") {
    return `${date} ${time}`;
  }
  return date;
}

function getRandomDate(): Date {
  const start = new Date(1970, 0, 1);
  const end = new Date(Date.now());
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

export function getRandomText(lowerType: string): string {
  const size = lowerType.match(/\((.*)\)/)?.pop();
  if (size) {
    return getWordsForMaxSize(Number(size));
  }
  if (lowerType.startsWith("medium") || lowerType.startsWith("long")) {
    return loremer.sentence();
  }
  if (lowerType.startsWith("tiny")) {
    return loremer.word({ maxLength: 255 });
  }
  return loremer.word();
}

function getWordsForMaxSize(size: number): string {
  const maxSize = Math.min(size, 200);
  if (maxSize < 21) {
    return loremer.word({ maxLength: maxSize });
  }
  const maxNumWords = Math.floor(maxSize / 10);
  const numWords = getRandomNumFromRange(2, maxNumWords);
  return nTimes(numWords, () =>
    loremer.word({ maxLength: maxSize / maxNumWords - 1 }),
  ).join(" ");
}

// Inclusive
function getRandomNumFromRange(min: number, max: number): number {
  const nmin = Math.ceil(min);
  const nmax = Math.floor(max);
  return Math.floor(Math.random() * (nmax - nmin + 1) + nmin);
}
