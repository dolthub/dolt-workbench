import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  useResetDatabaseMutation,
} from "@gen/graphql-types";
import useAddConnection from "@components/pageComponents/ConnectionsPage/ExistingConnections/useAddConnection";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { database } from "@lib/urls";
import { excerpt } from "@dolthub/web-utils";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  db: string;
  conn: DatabaseConnectionFragment;
  currentConnection: DatabaseConnectionFragment;
  currentDatabase: string;
};

export default function DatabaseItem({
  db,
  conn,
  currentConnection,
  currentDatabase,
}: Props) {
  const { onAdd } = useAddConnection(conn);
  const {
    mutateFn: resetDB,
    loading,
    err,
  } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();

  const onClick = async (databaseName: string) => {
    await onAdd();
    if (conn.type === DatabaseType.Postgres) {
      await resetDB({ variables: { newDatabase: databaseName } });
    }
    const { href, as } = database({ databaseName });
    router.push(href, as).catch(console.error);
  };

  if (loading) {
    return <Loader loaded={!loading} />;
  }

  if (err) {
    return <ErrorMsg err={err} />;
  }
  const dbName = excerpt(db, 32);
  if (db === currentDatabase && conn.name === currentConnection.name) {
    return (
      <span className={css.DbItem}>
        {dbName} <span className={css.viewing}>viewing</span>
      </span>
    );
  }
  return (
    <Button.Link
      className={cx(css.DbItem, css.link)}
      onClick={async () => onClick(db)}
    >
      <span>{dbName}</span>
      <FaChevronRight />
    </Button.Link>
  );
}
