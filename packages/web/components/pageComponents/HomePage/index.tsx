import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import FormInput from "@components/FormInput";
import Loader from "@components/Loader";
import DoltLink from "@components/links/DoltLink";
import { useAddDatabaseConnectionMutation } from "@gen/graphql-types";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

export default function HomePage() {
  const router = useRouter();
  const [addDb, res] = useAddDatabaseConnectionMutation();
  const [url, setUrl] = useState("");

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await addDb({ variables: { url } });
      await res.client.clearStore();
      router.push("/database").catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  return (
    <main className={css.container}>
      <h1>Welcome to the Dolt SQL Workbench</h1>
      <p>
        Connect to the workbench using any MySQL-compatible database. Use{" "}
        <DoltLink>Dolt</DoltLink> to unlock version control features, like
        branch, commits, and merge.
      </p>
      <form onSubmit={onSubmit}>
        <Loader loaded={!res.loading} />
        <FormInput
          value={url}
          onChangeString={setUrl}
          label="Connection string"
          placeholder="mysql://[username]:[password]@[host]/[database]"
        />
        <ButtonsWithError error={res.error}>
          <Button type="submit">Launch Workbench</Button>
        </ButtonsWithError>
      </form>
    </main>
  );
}
