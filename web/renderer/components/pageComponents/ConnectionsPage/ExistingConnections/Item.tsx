import { getDatabaseType } from "@components/DatabaseTypeLabel";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import css from "./index.module.css";
import useAddConnection from "./useAddConnection";

type Props = {
  conn: DatabaseConnectionFragment;
  onDeleteClicked?: (n: string) => void;
};

export default function Item({ conn, onDeleteClicked }: Props) {
  const { onAdd, err, loading } = useAddConnection(conn);

  return (
    <>
      <li key={conn.name} className={css.connection}>
        <Button.Link onClick={onAdd}>{conn.name}</Button.Link>
        <span className={css.right}>
          <DatabaseTypeLabel conn={conn} />
          {onDeleteClicked && (
            <Button.Link onClick={() => onDeleteClicked(conn.name)}>
              <IoMdClose />
            </Button.Link>
          )}
        </span>
      </li>
      <Loader loaded={!loading} />
      <ErrorMsg err={err} className={css.err} />
    </>
  );
}

type LabelProps = {
  conn: DatabaseConnectionFragment;
};

export function DatabaseTypeLabel({ conn }: LabelProps) {
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  return <span className={cx(css.label, css[type.toLowerCase()])}>{type}</span>;
}
