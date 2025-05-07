import { QueryHandler, ButtonWithPopup } from "@dolthub/react-components";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { DatabaseParams } from "@lib/params";
import {
  DatabaseConnectionFragment,
  useCurrentConnectionQuery,
} from "@gen/graphql-types";
import Link from "@components/links/Link";
import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import { excerpt } from "@dolthub/web-utils";
import { connections } from "@lib/urls";
import cx from "classnames";
import useSelectedConnection from "./useSelectedConnection";
import Popup from "./Popup";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
  setNoDrag?: (isOpen: boolean) => void;
  className?: string;
};

type InnerProps = Props & {
  connection: DatabaseConnectionFragment;
};

function Inner({ connection, params, setNoDrag, className }: InnerProps) {
  const { onSelected, state, storedConnections } =
    useSelectedConnection(connection);
  const [isOpen, setIsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(connectionsRef, () => {
    setIsOpen(false);
  });
  const triggerText = `${excerpt(connection.name, 12)} / ${excerpt(params.databaseName, 12)}`;

  return (
    <div className={cx(css.iconAndSelector, className)}>
      <FiDatabase className={css.dbIcon} />
      <ButtonWithPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        position="bottom center"
        offsetY={12}
        offsetX={-16}
        contentStyle={{ width: "auto", padding: 0 }}
        arrow={false}
        onOpen={async () => {
          if (setNoDrag) {
            setNoDrag(true);
          }
          await onSelected(connection);
        }}
        onClose={() => {
          if (setNoDrag) {
            setNoDrag(false);
          }
        }}
        triggerText={triggerText}
        buttonClassName={css.selector}
      >
        <div className={css.popup} ref={connectionsRef}>
          <Popup
            params={params}
            currentConnection={connection}
            onSelected={onSelected}
            state={state}
            storedConnections={storedConnections}
          />
        </div>
      </ButtonWithPopup>
    </div>
  );
}

export default function ConnectionsAndDatabases(props: Props) {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={{ ...res, data: res.data }}
      render={data =>
        data.currentConnection ? (
          <Inner {...props} connection={data.currentConnection} />
        ) : (
          <Link {...connections} className={css.connectionError}>
            Connections
          </Link>
        )
      }
    />
  );
}
