import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import CustomCheckbox from "@components/CustomCheckbox";
import FormInput from "@components/FormInput";
import Loader from "@components/Loader";
import { useAddDatabaseConnectionMutation } from "@gen/graphql-types";
import { database as databaseUrl } from "@lib/urls";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  hasDatabaseEnv: boolean;
  setShowForm: (s: boolean) => void;
};

export default function Form(props: Props) {
  const router = useRouter();
  const [connUrl, setConnUrl] = useState("");
  const [host, setHost] = useState("127.0.0.1");
  const [port, setPort] = useState("3306");
  const [username, setUsername] = useState("root");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [hideDoltFeatures, setHideDoltFeatures] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onCancel = props.hasDatabaseEnv
    ? () => {
        props.setShowForm(false);
        setConnUrl("");
      }
    : undefined;

  const onSubmit = async (e: SyntheticEvent, url: string) => {
    e.preventDefault();

    try {
      const db = await addDb({ variables: { url, hideDoltFeatures } });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } = databaseUrl({
        databaseName: db.data.addDatabaseConnection,
      });
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  return (
    <div className={css.databaseForm}>
      <div className={css.quickStart}>
        <form onSubmit={async e => onSubmit(e, connUrl)}>
          <Loader loaded={!res.loading} />
          <h3>Quick Start</h3>
          <FormInput
            value={connUrl}
            onChangeString={setConnUrl}
            label="Connection string"
            placeholder="mysql://[username]:[password]@[host]/[database]"
            light
          />
          <Button type="submit" disabled={!connUrl}>
            Go
          </Button>
        </form>
      </div>
      <div className={css.or}>OR</div>
      <div className={css.databaseConfig}>
        <form
          onSubmit={async e =>
            onSubmit(
              e,
              `mysql://${username}:${password}@${host}:${port}/${database}`,
            )
          }
        >
          <h3>Connectivity</h3>
          <FormInput
            label="Host"
            value={host}
            onChangeString={setHost}
            placeholder="127.0.0.1"
            horizontal
          />
          <FormInput
            label="Port"
            value={port}
            onChangeString={setPort}
            placeholder="3306"
            horizontal
          />
          <FormInput
            label="Username"
            value={username}
            onChangeString={setUsername}
            placeholder="root"
            horizontal
          />
          <FormInput
            label="Password"
            value={password}
            onChangeString={setPassword}
            placeholder="**********"
            type="password"
            horizontal
          />
          <FormInput
            label="Database"
            value={database}
            onChangeString={setDatabase}
            placeholder="mydb"
            horizontal
          />
          <Button.Link
            onClick={() => setShowAdvancedSettings(s => !s)}
            className={css.advancedSettings}
          >
            {showAdvancedSettings ? <FaCaretUp /> : <FaCaretDown />} Advanced
            settings
          </Button.Link>
          {showAdvancedSettings && (
            <div>
              <CustomCheckbox
                checked={hideDoltFeatures}
                onChange={() => setHideDoltFeatures(!hideDoltFeatures)}
                name="hide-dolt-features"
                label="Hide Dolt features"
                description="Hides Dolt features like branches, logs, and commits for non-Dolt MySQL databases. Will otherwise be disabled."
                className={css.checkbox}
              />
            </div>
          )}
          <ButtonsWithError error={res.error} onCancel={onCancel} left>
            <Button type="submit" disabled={!host || !database || !username}>
              Launch Workbench
            </Button>
          </ButtonsWithError>
        </form>
      </div>
    </div>
  );
}
