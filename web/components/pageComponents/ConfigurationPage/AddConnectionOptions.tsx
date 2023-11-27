import ErrorMsg from "@components/ErrorMsg";
import QueryHandler from "@components/util/QueryHandler";
import {
  AddDatabaseConnectionMutationVariables,
  StoredStateFragment,
  useAddDatabaseConnectionMutation,
  useDatabaseStateQuery,
} from "@gen/graphql-types";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import Form from "./Form";
import css from "./index.module.css";

type InnerProps = {
  hasDatabaseEnv: boolean;
  storedState?: StoredStateFragment;
};

function Inner({ storedState, ...props }: InnerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(
    !(props.hasDatabaseEnv || storedState),
  );
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onSubmit = async (
    e: SyntheticEvent,
    variables: AddDatabaseConnectionMutationVariables,
  ) => {
    e.preventDefault();
    try {
      const db = await addDb({ variables });
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
      <div className={css.whiteContainer}>
        <h3>Choose how to connect</h3>
        <div className={css.options}>
          {storedState ? (
            <button
              className={css.option}
              type="button"
              onClick={async e => onSubmit(e, storedState)}
            >
              <h3>Connect to existing database</h3>
            </button>
          ) : (
            <button
              type="button"
              onClick={async e => onSubmit(e, { useEnv: true })}
              className={css.option}
            >
              <h3>Use database connection URL from environment</h3>
            </button>
          )}
          <div className={css.or}>or</div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={css.option}
          >
            <h3>Connect to a new database</h3>
          </button>
        </div>
        <ErrorMsg err={res.error} className={css.err} />
      </div>
    );
  }

  return <Form {...props} setShowForm={setShowForm} />;
}

export default function AddConnectionOptions() {
  const res = useDatabaseStateQuery();
  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner
          hasDatabaseEnv={data.databaseState.hasEnv}
          storedState={data.databaseState.storedState ?? undefined}
        />
      )}
    />
  );
}
