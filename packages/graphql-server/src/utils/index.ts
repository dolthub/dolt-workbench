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
