import { getDatabaseType } from "@components/DatabaseTypeLabel";
import { Button, ErrorMsg } from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import { maybeDatabase, maybeSchema } from "@lib/urls";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
  onDeleteClicked: (n: string) => void;
};

export default function Item({ conn, onDeleteClicked }: Props) {
  const router = useRouter();
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onClick = async () => {
    try {
      const db = await addDb({ variables: conn });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } =
        conn.type === DatabaseType.Postgres
          ? maybeSchema(db.data.addDatabaseConnection.currentSchema)
          : maybeDatabase(db.data.addDatabaseConnection.currentDatabase);
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  return (
    <>
      <li key={conn.name} className={css.connection}>
        <Button.Link onClick={onClick}>{conn.name}</Button.Link>
        <span className={css.right}>
          <DatabaseTypeLabel conn={conn} />
          <Button.Link onClick={() => onDeleteClicked(conn.name)}>
            <IoMdClose />
          </Button.Link>
        </span>
      </li>
      <ErrorMsg err={res.error} className={css.err} />
    </>
  );
}

type LabelProps = {
  conn: DatabaseConnectionFragment;
};

function DatabaseTypeLabel({ conn }: LabelProps) {
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  return <span className={cx(css.label, css[type.toLowerCase()])}>{type}</span>;
}
