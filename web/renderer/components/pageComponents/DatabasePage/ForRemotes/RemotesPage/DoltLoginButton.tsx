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
  const [cancelId, setCancelId] = useState<string | null>(null);
  const success = useDelay(3000);

  const onLogin = async () => {
    let requestId: string | null = null;

    try {
      setPending(true);
      setErr(undefined);

      // Set up the listener for login process id
      const idPromise = new Promise<string>(resolve => {
        window.ipc.onLoginStarted((receivedId: string) => {
          resolve(receivedId);
        });
      });

      // Start login process
      const loginPromise = window.ipc.doltLogin(connection?.name);

      // Wait for either the ID or login completion
      requestId = await Promise.race([
        idPromise.then(id => {
          setCancelId(id);
        }),
        loginPromise.then(() => null),
      ]);

      if (!requestId) {
        // Login completed before we got the ID (very fast success/failure)
        const result = await loginPromise;
        if (result.success) {
          setLoggedInUser({
            email: result.email,
            username: result.username,
          });
          success.start();
        }
        return;
      }

      const result = await loginPromise;
      if (result.success) {
        setLoggedInUser({
          email: result.email,
          username: result.username,
        });
        success.start();
      }
      if (!result.success) {
        setErr(new Error(result.error || "Login failed"));
      }
    } catch (error) {
      setErr(new Error(`Failed to login: ${error}`));
    } finally {
      setPending(false);
      // Cleanup ID reference
      if (requestId) setCancelId(null);
    }
  };

  const cancelLogin = async () => {
    if (cancelId) {
      const success = await window.ipc.invoke("cancel-dolt-login", cancelId);
      if (success) {
        setPending(false);
        setErr(undefined);
        setLoggedInUser(undefined);
      } else {
        setErr(new Error("Cancel Login failed"));
      }
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
        <div>
          <Button
            onClick={onLogin}
            className={css.loginButton}
            disabled={pending}
          >
            {pending ? "Login..." : "Dolt Login"}
          </Button>
          {pending && (
            <Button.Link onClick={cancelLogin} className={css.loginButton}>
              cancel
            </Button.Link>
          )}
          {err && <ErrorMsg err={err} />}
        </div>
      )}
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
