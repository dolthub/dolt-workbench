import {
  ApolloClient,
  ApolloError,
  NormalizedCacheObject,
} from "@apollo/client";
import { useSessionQueryHistory } from "@dolthub/react-hooks";
import useSqlParser from "@hooks/useSqlParser";
import { SqlQueryParams } from "@lib/params";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { databases } from "@lib/urls";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function useSqlQuery(
  params: SqlQueryParams,
  client: ApolloClient<NormalizedCacheObject>,
  gqlError?: ApolloError,
): boolean {
  const { isMutation } = useSqlParser();
  const router = useRouter();
  const { addMutation } = useSessionQueryHistory(params.databaseName);
  const isMut = isMutation(params.q);

  useEffect(() => {
    if (!isMut) return;
    addMutation(params.q);
  }, [params.q]);

  useEffect(() => {
    if (!isMut) return;
    if (gqlError) return;
    // Need timeout here so that queries are not refetched before sql query has
    // time to finish
    setTimeout(() => {
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
    }, 300);
  }, [gqlError, isMut, client]);

  useEffect(() => {
    if (gqlError) {
      return;
    }
    const lower = params.q.toLowerCase();
    if (
      lower.includes("drop database") &&
      lower.includes(params.databaseName)
    ) {
      router.push(databases.hrefPathname()).catch(console.error);
    }
  }, [params.q, params.databaseName, gqlError]);

  return isMut;
}
