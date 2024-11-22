import {
  QueryHandler,
  ButtonWithPopup,
  ErrorMsg,
} from "@dolthub/react-components";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { DatabaseParams } from "@lib/params";
import {
  DatabaseConnectionFragment,
  useCurrentConnectionQuery,
} from "@gen/graphql-types";
import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import css from "./index.module.css";
import useSelectedConnection from "./useSelectedConnection";
import Popup from "./Popup";

type Props = {
  params: DatabaseParams;
};

type InnerProps = Props & {
  connection: DatabaseConnectionFragment;
};

function Inner({ connection, params }: InnerProps) {
  const { onSelected, state, storedConnections } =
    useSelectedConnection(connection);
  const [isOpen, setIsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(connectionsRef, () => {
    setIsOpen(false);
  });

  return (
    <div className={css.iconAndSelector}>
      <FiDatabase className={css.dbIcon} />
      <div className={css.selector}>
        <span className={css.label}>
          {connection.name} / {params.databaseName}
        </span>
        <ButtonWithPopup
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          position="bottom left"
          offsetY={10}
          contentStyle={{ width: "auto", padding: 0 }}
          arrow={false}
          onOpen={async () => onSelected(connection)}
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
    </div>
  );
}

export default function ConnectionsAndDatabases({ params }: Props) {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={{ ...res, data: res.data }}
      render={data =>
        data.currentConnection ? (
          <Inner params={params} connection={data.currentConnection} />
        ) : (
          <ErrorMsg errString="No connection found" />
        )
      }
    />
  );
}
