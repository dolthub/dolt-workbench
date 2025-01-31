import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import Image from "next/legacy/image";
import cx from "classnames";
import {
  DatabaseTypeLabel,
  getDatabaseType,
} from "@components/ConnectionsAndDatabases/DatabaseTypeLabel";
import useAddConnection from "./useAddConnection";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
  onDeleteClicked: (n: string) => void;
  borderClassName: string;
  shorterLine: boolean;
};

export default function Item({
  conn,
  onDeleteClicked,
  borderClassName,
  shorterLine,
}: Props) {
  const { onAdd, err, loading } = useAddConnection(conn);
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  return (
    <>
      <li key={conn.connectionName} className={css.connectionContainer}>
        <div
          className={cx(css.line, css[borderClassName], {
            [css.shorterLine]: shorterLine,
          })}
        />
        <div className={css.connection}>
          <div className={cx(css.left, css[type.toLowerCase()])}>
            <Image
              src="/images/database-icon.png"
              alt="DatabaseIcon"
              height={51}
              width={51}
            />
          </div>
          <div className={css.right}>
            <Button.Link
              onClick={() => onDeleteClicked(conn.connectionName)}
              className={css.delete}
            >
              <IoMdClose />
            </Button.Link>
            <div className={css.typeAndName}>
              <DatabaseTypeLabel conn={conn} />
              <Button.Link onClick={onAdd} className={css.name}>
                {conn.connectionName}
              </Button.Link>
            </div>
          </div>
        </div>
      </li>
      <Loader loaded={!loading} />
      <ErrorMsg err={err} className={css.err} />
    </>
  );
}
