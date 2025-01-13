import { getDatabaseType } from "@components/DatabaseTypeLabel";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import Image from "next/legacy/image";
import cx from "classnames";
import css from "./index.module.css";
import useAddConnection from "./useAddConnection";

type Props = {
  conn: DatabaseConnectionFragment;
  onDeleteClicked: (n: string) => void;
};

export default function Item({ conn, onDeleteClicked }: Props) {
  const { onAdd, err, loading } = useAddConnection(conn);
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  return (
    <>
      <li key={conn.name} className={css.connectionContainer}>
        <div className={css.line} />
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
            onClick={() => onDeleteClicked(conn.name)}
            className={css.delete}
          >
            <IoMdClose />
          </Button.Link>
          <div className={css.typeAndName}>
            <DatabaseTypeLabel conn={conn} />
            <Button.Link onClick={onAdd} className={css.name}>
              {conn.name}
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

type LabelProps = {
  conn: DatabaseConnectionFragment;
};

function DatabaseTypeLabel({ conn }: LabelProps) {
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  return <span className={css.label}>{type}</span>;
}
