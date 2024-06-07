export function maybeConvertToPG(plan: string, isPG = false): string {
  if (!isPG) return plan;
  const replaceQuotes = plan.replace(/"/g, "'");
  return replaceQuotes.replace(/`/g, '"');
}
