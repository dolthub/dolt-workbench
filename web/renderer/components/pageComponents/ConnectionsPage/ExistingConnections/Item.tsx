import { DatabaseTypeLabel } from "@components/ConnectionsAndDatabases/DatabaseTypeLabel";
import { getDatabaseType } from "@components/DatabaseTypeLabel";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import Image from "next/legacy/image";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";
import useAddConnection from "./useAddConnection";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

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
  const { onAdd, err, loading, doltServerIsActive } = useAddConnection(conn);
  const [startDoltServerError, setStartDoltServerError] = useState<
    Error | undefined
  >(undefined);
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const restartDoltServer =
      forElectron && conn.isLocalDolt && !doltServerIsActive;

    if (!restartDoltServer) {
      await onAdd();
      return;
    }

    try {
      await window.ipc.invoke("start-dolt-server", conn.name, conn.port, false);
    } catch (error) {
      setStartDoltServerError(new Error(`${error}`));
    }

    await onAdd();
  };

  return (
    <>
      <li
        key={conn.name}
        className={css.connectionContainer}
        data-cy={`connection-${conn.name}`}
      >
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
              onClick={() => onDeleteClicked(conn.name)}
              className={css.delete}
              data-cy={`delete-${conn.name}-button`}
            >
              <IoMdClose />
            </Button.Link>
            <div className={css.typeAndName}>
              <DatabaseTypeLabel conn={conn} />
              <Button.Link onClick={onSubmit} className={css.name}>
                {conn.name}
              </Button.Link>
            </div>
            <ErrorMsg err={err ?? startDoltServerError} className={css.err} />
          </div>
        </div>
      </li>
      <Loader loaded={!loading} />
    </>
  );
}
