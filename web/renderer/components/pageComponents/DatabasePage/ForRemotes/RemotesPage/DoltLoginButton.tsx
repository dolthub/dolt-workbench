import { Button, ErrorMsg, QueryHandler } from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  useCurrentConnectionQuery,
} from "@gen/graphql-types";
import { useState } from "react";
import { useDelay } from "@dolthub/react-hooks";
import css from "./index.module.css";

type InnerProps = {
  connection?: DatabaseConnectionFragment | null;
};

type LoggedInUser = {
  email: string;
  username: string;
};

function Inner({ connection }: InnerProps) {
  const [err, setErr] = useState<Error | undefined>(undefined);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | undefined>(
    undefined,
  );
  const [pending, setPending] = useState(false);

  const success = useDelay(3000);

  const onLogin = async () => {
    try {
      setPending(true);
      const result = await window.ipc.invoke("dolt-login", connection?.name);
      if (result.success) {
        // Login succeeded - update UI state
        setLoggedInUser({
          email: result.email,
          username: result.username,
        });
        success.start();
      } else {
        // Show error message
        setErr(new Error(result.error || "Login failed"));
      }
    } catch (error) {
      setErr(new Error(`Failed to login ${error}`));
    } finally {
      setPending(false);
    }
  };

  if (!connection?.isDolt) return null;

  return (
    <>
      {success.active ? (
        <div className={css.successMsg}>
          Logged in as {loggedInUser?.username} ({loggedInUser?.email})
        </div>
      ) : (
        <Button
          onClick={onLogin}
          className={css.loginButton}
          disabled={pending}
        >
          {pending ? "Login..." : "Dolt Login"}
        </Button>
      )}
      <ErrorMsg err={err} />
    </>
  );
}

export default function DoltLoginButton() {
  const res = useCurrentConnectionQuery();
  return (
    <QueryHandler
      result={{ ...res, data: res.data }}
      render={data => <Inner connection={data.currentConnection} />}
    />
  );
}
