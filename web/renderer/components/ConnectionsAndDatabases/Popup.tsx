import { DatabaseConnection, DatabaseType } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import Link from "@components/links/Link";
import { ErrorMsg, SmallLoader } from "@dolthub/react-components";
import CreateDatabase from "@components/CreateDatabase";
import { AiOutlinePlusCircle } from "@react-icons/all-files/ai/AiOutlinePlusCircle";
import { connections, newConnection } from "@lib/urls";
import { FiTool } from "@react-icons/all-files/fi/FiTool";
import { StateType } from "./useSelectedConnection";
import DatabaseItem from "./DatabaseItem";
import css from "./index.module.css";
import ConnectionItem from "./ConnectionItem";

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
          <div className={css.icons}>
            <Link {...connections}>
              <FiTool className={css.wrench} />
            </Link>
            <Link {...newConnection}>
              <AiOutlinePlusCircle className={css.plus} />
            </Link>
          </div>
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
            <ConnectionItem
              key={conn.name}
              conn={conn}
              currentConnection={currentConnection}
              onSelected={onSelected}
              selectedConnection={state.connection}
            />
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
