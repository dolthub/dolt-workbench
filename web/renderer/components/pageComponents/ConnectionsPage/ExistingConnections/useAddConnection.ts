import {
  DatabaseConnectionFragment,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";

type ReturnType = {
  onAdd: () => Promise<void>;
  err: ApolloErrorType;
  loading: boolean;
};

export default function useAddConnection(
  conn: DatabaseConnectionFragment,
): ReturnType {
  const router = useRouter();
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onAdd = async () => {
    try {
      const db = await addDb({ variables: conn });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } = maybeDatabase(
        db.data.addDatabaseConnection.currentDatabase,
      );
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  return { onAdd, err: res.error, loading: res.loading };
}
