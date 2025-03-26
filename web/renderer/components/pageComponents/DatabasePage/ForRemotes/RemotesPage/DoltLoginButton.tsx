import {
  Button,
  ErrorMsg,
  QueryHandler,
  SmallLoader,
} from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  useCurrentConnectionQuery,
} from "@gen/graphql-types";
import { useState } from "react";
import css from "./index.module.css";

type InnerProps = {
  connection?: DatabaseConnectionFragment | null;
};

function Inner({ connection }: InnerProps) {
  const [err, setErr] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      window.ipc.invoke("dolt-login", connection?.name);
    } catch (error) {
      setErr(new Error(`Failed to login ${error}`));
    } finally {
      setLoading(false);
    }
  };

  if (!connection?.isDolt) return null;

  return (
    <>
      <Button onClick={onLogin} className={css.loginButton}>
        Dolt Login
      </Button>
      <ErrorMsg err={err} />
      <SmallLoader loaded={!loading} />
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
