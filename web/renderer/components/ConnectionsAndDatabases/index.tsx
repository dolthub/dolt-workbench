import {
  QueryHandler,
  ButtonWithPopup,
  ErrorMsg,
} from "@dolthub/react-components";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { DatabaseParams } from "@lib/params";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import Inner from "./Inner";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

export default function ConnectionsAndDatabases({ params }: Props) {
  const res = useCurrentConnectionQuery();
  const [isOpen, setIsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(connectionsRef, () => {
    setIsOpen(false);
  });
  return (
    <QueryHandler
      result={{ ...res, data: res.data }}
      render={data =>
        data.currentConnection ? (
          <>
            {" "}
            <FiDatabase className={css.dbIcon} />
            <div className={css.selector}>
              <span className={css.label}>
                {data.currentConnection.name} / {params.databaseName}
              </span>
              <ButtonWithPopup
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                position="bottom left"
                offsetY={10}
                contentStyle={{ width: "auto", padding: 0 }}
                arrow={false}
              >
                <div className={css.popup} ref={connectionsRef}>
                  <Inner
                    params={params}
                    currentConnection={data.currentConnection}
                  />
                </div>
              </ButtonWithPopup>
            </div>
          </>
        ) : (
          <ErrorMsg errString="No connection found" />
        )
      }
    />
  );
}
