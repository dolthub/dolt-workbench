import {
  Button,
  ErrorMsg,
  Popup,
  QueryHandler,
} from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  useCurrentConnectionQuery,
} from "@gen/graphql-types";
import { useState } from "react";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import { useDelay } from "@dolthub/react-hooks";
import Link from "@components/links/Link";
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

  if (!connection?.isLocalDolt) return null;

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
      const loginPromise = window.ipc.doltLogin(connection.name);

      // Wait for either the ID or login completion
      requestId = await Promise.race([
        idPromise.then(id => {
          setCancelId(id);
        }),
        loginPromise.then(() => null),
      ]);

      const result = await loginPromise;
      if (result.success) {
        setLoggedInUser({
          email: result.email,
          username: result.username,
        });
        success.start();
      }
      // Cleanup ID reference
      if (requestId) setCancelId(null);
    } catch (error) {
      setErr(new Error(`Failed to login: ${error}`));
    } finally {
      setPending(false);
    }
  };

  const cancelLogin = async () => {
    if (cancelId) {
      const cancelSuccess = await window.ipc.invoke(
        "cancel-dolt-login",
        cancelId,
      );
      if (cancelSuccess) {
        setPending(false);
        setErr(undefined);
        setLoggedInUser(undefined);
      } else {
        setErr(new Error("Cancel Login failed"));
      }
    }
  };

  return (
    <div>
      {success.active ? (
        <div className={css.successMsg}>
          {loggedInUser
            ? `Logged in as ${loggedInUser.username} (${loggedInUser.email})`
            : "Logged in successfully!"}
        </div>
      ) : (
        <div className={css.buttons}>
          <Button
            onClick={onLogin}
            className={css.loginButton}
            disabled={pending}
          >
            {pending ? "Logging in..." : "Dolt Login"}
            <Popup
              on="hover"
              position="bottom center"
              offsetX={6}
              offsetY={6}
              contentStyle={{ width: "400px", padding: "15px" }}
              trigger={<BsFillQuestionCircleFill className={css.infoIcon} />}
            >
              <p>
                dolt login authenticates your local dolt client to DoltHub.com,
                associates your client with your DoltHub identity. To learn more
                about dolt login, see our{" "}
                <Link href="https://docs.dolthub.com/cli-reference/cli#dolt-login">
                  documentation
                </Link>
                .
              </p>
            </Popup>
          </Button>

          {pending && (
            <Button.Link onClick={cancelLogin} className={css.loginButton}>
              cancel
            </Button.Link>
          )}
          {err && <ErrorMsg err={err} />}
        </div>
      )}
    </div>
  );
}

export default function DoltLoginButton() {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={res}
      render={data => <Inner connection={data.currentConnection} />}
    />
  );
}
