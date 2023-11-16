import Loader from "@components/Loader";
import {
  useAddDatabaseConnectionMutation,
  useHasDatabaseEnvQuery,
} from "@gen/graphql-types";
import useEffectAsync from "@hooks/useEffectAsync";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";
import { useState } from "react";
import ConfigurationPage from "../ConfigurationPage";

export default function HomePage() {
  const router = useRouter();
  const res = useHasDatabaseEnvQuery();
  const [addDb] = useAddDatabaseConnectionMutation();
  const [loading, setLoading] = useState(true);

  useEffectAsync(async () => {
    if (!res.data) return;
    if (!res.data.hasDatabaseEnv) {
      setLoading(false);
      return;
    }
    try {
      const db = await addDb({ variables: { useEnv: true } });
      await res.client.clearStore();
      if (!db.data) {
        setLoading(false);
        return;
      }
      const { href, as } = maybeDatabase(db.data.addDatabaseConnection);
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
      setLoading(false);
    }
  }, [res.data?.hasDatabaseEnv]);

  if (loading) return <Loader loaded={false} />;
  return <ConfigurationPage />;
}
