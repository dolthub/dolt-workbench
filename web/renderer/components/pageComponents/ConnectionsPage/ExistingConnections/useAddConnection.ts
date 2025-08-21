import {
  DatabaseConnectionFragment,
  useAddDatabaseConnectionMutation,
  useDoltServerStatusQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { ApolloErrorType } from "@lib/errors/types";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";

type ReturnType = {
  onAdd: () => Promise<void>;
  err: ApolloErrorType;
  loading: boolean;
  doltServerIsActive?: boolean;
};

export default function useAddConnection(
  conn: DatabaseConnectionFragment,
): ReturnType {
  const router = useRouter();
  const { mutateFn: addDb, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
  });
  const doltServerStatus = useDoltServerStatusQuery({
    variables: conn,
  });

  const onAdd = async () => {
    try {
      const { data, success } = await addDb({ variables: conn });
      if (!success || !data) {
        return;
      }
      await res.client.cache.reset();

      const { href, as } = maybeDatabase(
        data.addDatabaseConnection.currentDatabase,
      );
      router.push(href, as).catch(console.error);
    } catch {
      // Handled by res.error
    }
  };

  return {
    onAdd,
    err: res.err ?? doltServerStatus.error,
    loading: res.loading,
    doltServerIsActive: !!doltServerStatus.data?.doltServerStatus.active,
  };
}
