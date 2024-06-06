export function maybeConvertToPG(plan: string, isPG = false): string {
  if (!isPG) return plan;
  return plan.replace(/`/g, '"');
}
