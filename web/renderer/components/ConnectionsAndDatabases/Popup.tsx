import { DatabaseConnection, DatabaseType } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import Link from "@components/links/Link";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { Button, ErrorMsg, SmallLoader } from "@dolthub/react-components";
import CreateDatabase from "@components/CreateDatabase";
import { StateType } from "./useSelectedConnection";
import DatabaseItem from "./DatabaseItem";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
  currentConnection: DatabaseConnection;
  onSelected: (conn: DatabaseConnection) => void;
  storedConnections: DatabaseConnection[];
  state: StateType;
};

export default function Popup({
  params,
  currentConnection,
  onSelected,
  storedConnections,
  state,
}: Props) {
  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={cx(css.header, css.left)}>
          <span>CONNECTIONS</span>
        </div>
        <div className={cx(css.header, css.right)}>
          <span>DATABASES</span>
          <CreateDatabase
            isPostgres={currentConnection.type === DatabaseType.Postgres}
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
          {state.loading && <SmallLoader loaded={!state.loading} />}
          {state.databases.map(db => (
            <DatabaseItem
              key={db}
              db={db}
              conn={state.connection}
              currentDatabase={params.databaseName}
            />
          ))}
          <ErrorMsg err={state.err} />
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
