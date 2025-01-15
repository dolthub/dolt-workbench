import {
  DatabaseConnection,
  DatabaseConnectionFragment,
} from "@gen/graphql-types";
import { MdRemoveRedEye } from "@react-icons/all-files/md/MdRemoveRedEye";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { Button } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import cx from "classnames";
import { StateType } from "./useSelectedConnection";
import { DatabaseTypeLabel } from "./DatabaseTypeLabel";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
  state: StateType;
  onSelected: (conn: DatabaseConnection) => void;
  currentConnection: DatabaseConnection;
};
export default function ConnectionItem({
  conn,
  state,
  onSelected,
  currentConnection,
}: Props) {
  return (
    <Button.Link
      key={conn.name}
      className={cx(css.connection, {
        [css.selected]: state.connection.name === conn.name,
      })}
      onClick={async () => onSelected(conn)}
    >
      <div className={css.connectionTop}>
        <div className={css.nameAndLabel}>
          <span className={css.connectionName}>{excerpt(conn.name, 16)}</span>
          <DatabaseTypeLabel conn={conn} />
          {conn.name === currentConnection.name && (
            <MdRemoveRedEye className={css.viewing} />
          )}
        </div>
        <FaChevronRight className={css.arrow} />
      </div>
      <div className={css.connectionUrl}>
        {excerpt(getHostAndPort(conn.connectionUrl), 42)}
      </div>
    </Button.Link>
  );
}

function getHostAndPort(connectionString: string) {
  const url = new URL(connectionString);
  return `${url.hostname}:${url.port}`;
}
