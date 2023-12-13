export const ROW_LIMIT = 50;

// Gets UTC date in format YYYY-MM-DD HH:MM:SS
export function convertDateToUTCDatetimeString(d: Date): string {
  return `${convertDateToUTCDateString(d)} ${convertDateToUTCTimeString(d)}`;
}

// Gets UTC date in format YYYY-MM-DD
function convertDateToUTCDateString(d: Date): string {
  return `${d.getFullYear()}-${zeroPadNumber(
    d.getUTCMonth() + 1,
  )}-${zeroPadNumber(d.getUTCDate())}`;
}

// Gets UTC time in format HH:MM:SS
function convertDateToUTCTimeString(d: Date): string {
  return `${zeroPadNumber(d.getUTCHours())}:${zeroPadNumber(
    d.getUTCMinutes(),
  )}:${zeroPadNumber(d.getUTCSeconds())}`;
}

function zeroPadNumber(num: number): string {
  if (num < 10) {
    return `0${num}`;
  }
  return String(num);
}

export function getNextOffset(
  rowLen: number,
  offset: number,
): number | undefined {
  return rowLen > ROW_LIMIT ? offset + ROW_LIMIT : undefined;
}

// Commit dates come in UTC but javascript thinks it's local. Must manually
// convert to UTC.
export function convertToUTCDate(d: Date): Date {
  const utcDate = new Date(d);
  utcDate.setUTCFullYear(d.getFullYear());
  utcDate.setUTCMonth(d.getMonth());
  utcDate.setUTCDate(d.getDate());
  utcDate.setUTCHours(d.getHours());
  utcDate.setUTCMinutes(d.getMinutes());
  utcDate.setUTCSeconds(d.getSeconds());
  return utcDate;
}

export async function handleTableNotFound<T>(
  q: () => Promise<T | undefined>,
): Promise<T | undefined> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (err.message.includes("table not found")) {
      return undefined;
    }
    throw err;
  }
}
