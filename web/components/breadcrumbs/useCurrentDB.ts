import { useCurrentDatabaseQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";

export default function useCurrentDB(): string | undefined {
  const { isPostgres } = useDatabaseDetails();
  const res = useCurrentDatabaseQuery();

  if (!isPostgres) return undefined;
  return res.data?.currentDatabase ?? undefined;
}
