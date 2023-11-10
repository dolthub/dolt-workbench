export function numToStringWithCommas(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function numToUsdWithCommas(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function numToRoundedUsdWithCommas(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
