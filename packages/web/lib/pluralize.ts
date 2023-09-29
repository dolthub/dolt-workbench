export function pluralize(num: number, str: string): string {
  if (num === 1) {
    return str;
  }
  return getPlural(str);
}

function getPlural(s: string): string {
  switch (s) {
    case "person":
      return "people";
    case "repository":
      return "repositories";
    case "database":
      return "databases";
    case "database updated today":
      return "databases updated today";
    default:
      return `${s}s`;
  }
}
