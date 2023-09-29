import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import FormInput from "@components/FormInput";
import Loader from "@components/Loader";
import QueryHandler from "@components/util/QueryHandler";
import {
  useAddDatabaseConnectionMutation,
  useHasDatabaseEnvQuery,
} from "@gen/graphql-types";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";

type InnerProps = {
  hasDatabaseEnv: boolean;
};

function Inner(props: InnerProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [showForm, setShowForm] = useState(!props.hasDatabaseEnv);
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onCancel = props.hasDatabaseEnv
    ? () => {
        setShowForm(false);
        setUrl("");
      }
    : undefined;

  const onSubmit = async (e: SyntheticEvent, useEnv = false) => {
    e.preventDefault();
    const variables = useEnv ? { useEnv: true } : { url };
    try {
      await addDb({ variables });
      await res.client.clearStore();
      router.push("/database").catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  if (!showForm) {
    return (
      <form onSubmit={async e => onSubmit(e, true)}>
        <p>
          A database connection URL was found in the environment. You can use
          this connection or create a new one.
        </p>
        <ButtonsWithError error={res.error}>
          <Button type="submit">Use connection URL from env</Button>
          <Button onClick={() => setShowForm(true)}>
            Change connection URL
          </Button>
        </ButtonsWithError>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Loader loaded={!res.loading} />
      <FormInput
        value={url}
        onChangeString={setUrl}
        label="Connection string"
        placeholder="mysql://[username]:[password]@[host]/[database]"
      />
      <ButtonsWithError error={res.error} onCancel={onCancel}>
        <Button type="submit">Launch Workbench</Button>
      </ButtonsWithError>
    </form>
  );
}

export default function AddConnectionForm() {
  const res = useHasDatabaseEnvQuery();
  return (
    <QueryHandler
      result={res}
      render={data => <Inner hasDatabaseEnv={data.hasDatabaseEnv} />}
    />
  );
}
