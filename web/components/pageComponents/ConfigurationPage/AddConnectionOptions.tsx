import ErrorMsg from "@components/ErrorMsg";
import QueryHandler from "@components/util/QueryHandler";
import {
  useAddDatabaseConnectionMutation,
  useHasDatabaseEnvQuery,
} from "@gen/graphql-types";
import { maybeDatabase } from "@lib/urls";
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
      const { href, as } = maybeDatabase(db.data.addDatabaseConnection);
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  if (!showForm) {
    return (
      <div>
        <div className={css.options}>
          <button type="button" onClick={onSubmit} className={css.option}>
            <h3>Use database connection URL from environment</h3>
          </button>
          <div>or</div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={css.option}
          >
            <h3>Connect to a different database</h3>
          </button>
        </div>
        <ErrorMsg err={res.error} className={css.err} />
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
