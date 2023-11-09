import { format } from "timeago.js";

// TIME IN MS
const oneSecond = 1000;
const oneMinute = oneSecond * 60;
export const oneHour = oneMinute * 60;

export function getDateAndTimeString(date: Date): string {
  const d = getDateString(date);
  const t = getTimeString(date);
  return `${d}T${t}`;
}

export function getUTCDateAndTimeString(date: Date): string {
  const d = getUTCDateString(date);
  const t = `${getUTCTimeString(date)}:${zeroPadNumber(date.getUTCSeconds())}`;
  return `${d} ${t}`;
}

export function getDateString(date: Date): string {
  const month = zeroPadNumber(date.getMonth() + 1); // January is 0
  const day = zeroPadNumber(date.getDate());
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export function getUTCDateString(date: Date): string {
  const month = zeroPadNumber(date.getUTCMonth() + 1); // January is 0
  const day = zeroPadNumber(date.getUTCDate());
  const year = date.getUTCFullYear();
  return `${year}-${month}-${day}`;
}

export function getUTCDateStringSlashes(date: Date): string {
  const month = zeroPadNumber(date.getUTCMonth() + 1); // January is 0
  const day = zeroPadNumber(date.getUTCDate());
  return `${month}/${day}`;
}

function getTimeString(date: Date): string {
  const hour = date.getHours();
  const mins = date.getMinutes();
  return `${zeroPadNumber(hour)}:${zeroPadNumber(mins)}`;
}

export function getUTCTimeString(date: Date): string {
  const hour = date.getUTCHours();
  const mins = date.getUTCMinutes();
  return `${zeroPadNumber(hour)}:${zeroPadNumber(mins)}`;
}

function zeroPadNumber(num: number): string {
  if (num < 10) {
    return `0${num}`;
  }
  return String(num);
}

export function getNow(): Date {
  return new Date(Date.now());
}

export function getNowMinusHours(hours: number): Date {
  const now = getNow();
  return getDateMinusHours(now, hours);
}

export function getNowMinusMinutes(mins: number): Date {
  const now = getNow();
  return getDateMinusMinutes(now, mins);
}

export function getDateMinusHours(date: Date, hours: number): Date {
  if (hours === 0) return date;
  date.setHours(date.getHours() - hours);
  return date;
}

export function getDateMinusMinutes(date: Date, mins: number): Date {
  if (mins === 0) return date;
  date.setMinutes(date.getMinutes() - mins);
  return date;
}

export function getDatePlusHours(date: Date, hours: number): Date {
  if (hours === 0) return date;
  date.setHours(date.getHours() + hours);
  return date;
}

export function getNowMinusDays(days: number): Date {
  const now = getNow();
  now.setDate(now.getDate() - days);
  return now;
}

export function getUTCNowDateString(): string {
  return getUTCDateString(getNow());
}

// Gets local time in format "M/DD/YYYY, HH:MM [AM|PM]"
export function longDateTimeString(d: Date): string {
  const [date, time, period] = d.toLocaleString().split(" ");
  const per = period ? ` ${period}` : "";
  return `${date} ${time.slice(0, -3)}${per}`;
}

function getTime(date: Date): string {
  const hour = zeroPadNumber(date.getHours());
  const mins = zeroPadNumber(date.getMinutes());
  return `${hour}:${mins}`;
}

export function getTimeWithSeconds(date: Date): string {
  const t = getTime(date);
  return `${t}:${zeroPadNumber(date.getSeconds())}`;
}

export function getTimeAgoString(oldDateTime: number): string {
  return format(new Date(oldDateTime));
}

export function isLessThanNMinAgo(
  min: number,
  dt?: string | number | null,
): boolean {
  if (!dt) return false;
  const nowMinusNMins = getNowMinusMinutes(min);
  const d = new Date(Number(dt));
  return d > nowMinusNMins;
}
