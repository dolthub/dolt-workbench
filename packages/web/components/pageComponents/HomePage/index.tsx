import Button from "@components/Button";
import Loader from "@components/Loader";
import Navbar from "@components/Navbar";
import DoltLink from "@components/links/DoltLink";
import Link from "@components/links/Link";
import {
  useAddDatabaseConnectionMutation,
  useHasDatabaseEnvQuery,
} from "@gen/graphql-types";
import useEffectAsync from "@hooks/useEffectAsync";
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import css from "./index.module.css";

export default function HomePage() {
  const router = useRouter();
  const res = useHasDatabaseEnvQuery();
  const [addDb, addRes] = useAddDatabaseConnectionMutation();

  useEffectAsync(async () => {
    if (!res.data?.hasDatabaseEnv) return;
    try {
      const db = await addDb({ variables: { useEnv: true } });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } = database({
        databaseName: db.data.addDatabaseConnection,
      });
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  }, [res.data?.hasDatabaseEnv]);

  return (
    <div>
      <Navbar home />
      <Loader loaded={!res.loading && !addRes.loading} />
      <main className={css.container}>
        <h1>Welcome to the Dolt Workbench</h1>
        <p>
          Connect to the workbench using any MySQL-compatible database. Use{" "}
          <DoltLink>Dolt</DoltLink> to unlock version control features, like
          branch, commits, and merge.
        </p>
        <p>
          <Link href="/configuration">
            <Button>Get Started</Button>
          </Link>
        </p>
      </main>
    </div>
  );
}
