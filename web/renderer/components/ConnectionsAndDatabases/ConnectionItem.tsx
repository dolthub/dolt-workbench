import {
  DatabaseConnection,
  DatabaseConnectionFragment,
} from "@gen/graphql-types";
import URLParse from "url-parse";
import { MdRemoveRedEye } from "@react-icons/all-files/md/MdRemoveRedEye";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { Button } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import cx from "classnames";
import { DatabaseTypeLabel } from "./DatabaseTypeLabel";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
  selectedConnection: DatabaseConnectionFragment;
  onSelected: (conn: DatabaseConnection) => void;
  currentConnection: DatabaseConnection;
};
export default function ConnectionItem({
  conn,
  selectedConnection,
  onSelected,
  currentConnection,
}: Props) {
  return (
    <Button.Link
      key={conn.connectionName}
      className={cx(css.connection, {
        [css.selected]:
          selectedConnection.connectionName === conn.connectionName,
      })}
      onClick={async () => onSelected(conn)}
    >
      <div className={css.connectionTop}>
        <div className={css.nameAndLabel}>
          <span className={css.connectionName}>
            {excerpt(conn.connectionName, 16)}
          </span>
          <DatabaseTypeLabel conn={conn} />
          {conn.connectionName === currentConnection.connectionName && (
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
  try {
    const url = new URLParse(connectionString);
    return `${url.hostname}:${url.port}`;
  } catch (error) {
    console.error("Failed to parse URL:", error);
    return "";
  }
}
