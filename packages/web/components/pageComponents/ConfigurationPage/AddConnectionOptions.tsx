import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import QueryHandler from "@components/util/QueryHandler";
import {
  useAddDatabaseConnectionMutation,
  useHasDatabaseEnvQuery,
} from "@gen/graphql-types";
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import Form from "./Form";
import css from "./index.module.css";

type InnerProps = {
  hasDatabaseEnv: boolean;
};

function Inner(props: InnerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(!props.hasDatabaseEnv);
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
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
  };

  if (!showForm) {
    return (
      <div className={css.top}>
        <p>
          A database connection URL was found in the environment. You can use
          this connection or create a new one.
        </p>
        <form onSubmit={onSubmit}>
          <ButtonsWithError error={res.error}>
            <Button type="submit">Use connection URL from env</Button>
            <Button onClick={() => setShowForm(true)}>
              Change connection URL
            </Button>
          </ButtonsWithError>
        </form>
      </div>
    );
  }

  return <Form {...props} setShowForm={setShowForm} />;
}

export default function AddConnectionOptions() {
  const res = useHasDatabaseEnvQuery();
  return (
    <QueryHandler
      result={res}
      render={data => <Inner hasDatabaseEnv={data.hasDatabaseEnv} />}
    />
  );
}
