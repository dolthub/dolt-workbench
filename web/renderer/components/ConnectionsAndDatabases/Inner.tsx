import { DatabaseConnection, DatabaseType } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import Link from "@components/links/Link";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { Button } from "@dolthub/react-components";
import CreateDatabase from "@components/CreateDatabase";
import useSelectedConnection from "./useSelectedConnection";
import DatabaseItem from "./DatabaseItem";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
  currentConnection: DatabaseConnection;
};

export default function Inner(props: Props) {
  const { onSelected, state, storedConnections } = useSelectedConnection(
    props.currentConnection,
  );

  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={cx(css.header, css.left)}>
          <span>CONNECTIONS</span>
        </div>
        <div className={cx(css.header, css.right)}>
          <span>DATABASES</span>
          <CreateDatabase
            isPostgres={props.currentConnection.type === DatabaseType.Postgres}
          />
        </div>
      </div>
      <div className={css.middle}>
        <div className={css.left}>
          {storedConnections.map(conn => (
            <Button.Link
              key={conn.name}
              className={cx(css.item, {
                [css.selected]: state.connection.name === conn.name,
              })}
              onClick={async () => onSelected(conn)}
            >
              <span>{conn.name}</span>
              <FaChevronRight />
            </Button.Link>
          ))}
        </div>
        <div className={css.right}>
          {state.databases
            .filter(db => db !== props.params.databaseName)
            .map(db => (
              <DatabaseItem key={db} db={db} conn={state.connection} />
            ))}
        </div>
      </div>
      <div className={css.bottom}>
        <div className={css.left}>
          <Link href="/connections" className={css.manageConnection}>
            manage
          </Link>
        </div>
      </div>
    </div>
  );
}
