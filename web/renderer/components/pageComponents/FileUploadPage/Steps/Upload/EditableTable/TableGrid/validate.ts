import cx from "classnames";
import css from "./index.module.css";

const yearRegex = /^\d{4}$/; // YYYY
const timeRegex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/; // HH:MM:SS
const dateRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD
const datetimeRegex =
  /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])\s(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/; // YYYY-MM-DD HH:MM:SS

export function getValidationClass(value: string, type?: string): string {
  if (!type || value === "") return "";
  const lower = type.toLowerCase();
  if (
    lower.includes("int") ||
    lower.includes("float") ||
    lower.includes("double") ||
    lower.includes("decimal")
  ) {
    if (!isNumeric(value)) {
      return cx(css.cellError, "int-err");
    }
    return "";
  }
  if (lower.includes("datetime") || lower.includes("timestamp")) {
    return value.match(datetimeRegex) ? "" : cx(css.cellError, "datetime-err");
  }
  if (lower.includes("time")) {
    return value.match(timeRegex) ? "" : cx(css.cellError, "time-err");
  }
  if (lower.includes("date")) {
    return value.match(dateRegex) ? "" : cx(css.cellError, "date-err");
  }
  if (lower.includes("year")) {
    return value.match(yearRegex) ? "" : cx(css.cellError, "year-err");
  }
  return "";
}

export function handleErrorClasses() {
  const classes: string[][] = [
    ["int-err", "Not valid number"],
    ["datetime-err", "Not valid datetime"],
    ["time-err", "Not valid time"],
    ["date-err", "Not valid date"],
    ["year-err", "Not valid year"],
  ];
  classes.forEach(errClass => setDataTextForClass(errClass[0], errClass[1]));
}

function setDataTextForClass(className: string, text: string) {
  [...document.getElementsByClassName(className)].forEach(errCell => {
    errCell.setAttribute("data-text", text);
  });
}

export function isNumeric(value: string): boolean {
  const stripped = value.trim();
  if (stripped === "") return false;
  return !Number.isNaN(Number(value));
}
