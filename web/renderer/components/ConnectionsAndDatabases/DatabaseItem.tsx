import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { MdRemoveRedEye } from "@react-icons/all-files/md/MdRemoveRedEye";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  useAddDatabaseConnectionMutation,
  useResetDatabaseMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { maybeDatabase } from "@lib/urls";
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
  const {
    mutateFn: resetDB,
    loading,
    err,
  } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onClick = async (databaseName: string) => {
    const addedDb = await addDb({ variables: conn });
    await res.client.clearStore();
    if (!addedDb.data) {
      return;
    }

    if (conn.type === DatabaseType.Postgres) {
      await resetDB({ variables: { newDatabase: databaseName } });
    }
    const { href, as } = maybeDatabase(databaseName);
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
      <span className={css.dbItem}>
        {dbName}
        <MdRemoveRedEye className={css.viewing} />
      </span>
    );
  }
  return (
    <Button.Link
      className={cx(css.dbItem, css.link)}
      onClick={async () => onClick(db)}
    >
      {dbName}
    </Button.Link>
  );
}
