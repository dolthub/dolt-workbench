import { StatusFragment } from "@gen/graphql-types";

export function getStatusForUncommittedRef(
  status: StatusFragment[],
  refName: "STAGED" | "WORKING",
): StatusFragment[] {
  return status.filter(st => st.staged === (refName === "STAGED"));
}
