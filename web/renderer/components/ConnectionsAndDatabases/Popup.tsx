import { DatabaseConnection, DatabaseType } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import Link from "@components/links/Link";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { MdRemoveRedEye } from "@react-icons/all-files/md/MdRemoveRedEye";
import { Button, ErrorMsg, SmallLoader } from "@dolthub/react-components";
import CreateDatabase from "@components/CreateDatabase";
import { excerpt } from "@dolthub/web-utils";
import { FiTool } from "@react-icons/all-files/fi/FiTool";
import { StateType } from "./useSelectedConnection";
import DatabaseItem from "./DatabaseItem";
import { DatabaseTypeLabel } from "./DatabaseTypeLabel";
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
  console.log(state);
  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={cx(css.header, css.left)}>
          <span>CONNECTIONS</span>
          <Link href="/connections">
            <FiTool className={css.wrench} />
          </Link>
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
              className={cx(css.connection, {
                [css.selected]: state.connection.name === conn.name,
              })}
              onClick={async () => onSelected(conn)}
            >
              <div className={css.connectionTop}>
                <div className={css.nameAndLabel}>
                  <span className={css.connectionName}>
                    {excerpt(conn.name, 16)}
                  </span>
                  <DatabaseTypeLabel conn={conn} />
                  {conn.name === currentConnection.name && (
                    <MdRemoveRedEye className={css.viewing} />
                  )}
                </div>
                <FaChevronRight className={css.arrow} />
              </div>
              <div className={css.connectionUrl}>
                {excerpt(conn.connectionUrl, 42)}
              </div>
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
              currentConnection={currentConnection}
              currentDatabase={params.databaseName}
            />
          ))}
          <ErrorMsg err={state.err} />
        </div>
      </div>
    </div>
  );
}
