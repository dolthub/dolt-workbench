import { useApolloClient } from "@apollo/client";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { useCallProcedureMutation } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { ref } from "@lib/urls";
import { useRouter } from "next/router";
import useMutation from "../useMutation";

type CallProcedureResult = { success: boolean };

type UseCallProcedureReturn = {
  callProcedure: (name: string, args: string[]) => Promise<CallProcedureResult>;
  loading: boolean;
};

export default function useCallProcedure(
  params: RefParams,
): UseCallProcedureReturn {
  const { setExecutedQuery, setError, setExecutionMessage } =
    useSqlEditorContext();
  const { mutateFn, loading } = useMutation({
    hook: useCallProcedureMutation,
  });
  const client = useApolloClient();
  const router = useRouter();

  const callProcedure = async (
    name: string,
    args: string[],
  ): Promise<CallProcedureResult> => {
    const res = await mutateFn({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        name,
        args,
      },
    });
    if (res.success && res.data?.callProcedure) {
      setExecutedQuery(res.data.callProcedure.queryString, {
        isMutation: true,
      });
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      const { href, as } = ref(params).withQuery({
        executedSql: res.data.callProcedure.queryString,
      });
      await router.push(href, as).catch(console.error);
      setExecutionMessage(res.data.callProcedure.executionMessage);
      return { success: true };
    }
    if (res.error) {
      setError(res.error);
    }
    return { success: false };
  };

  return { callProcedure, loading };
}
