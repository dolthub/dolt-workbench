import { QueryHandler, ButtonWithPopup } from "@dolthub/react-components";
import Link from "@components/links/Link";
import css from "./index.module.css";
import { useStoredConnectionsQuery } from "@gen/graphql-types";
import Item from "@components/pageComponents/ConnectionsPage/ExistingConnections/Item";
import { useState } from "react";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";

export default function Connections() {
  const res = useStoredConnectionsQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={css.connections}>
      <Link href="/connections" className={css.label}>
        connections
      </Link>
      <ButtonWithPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        position="bottom center"
        offsetX={0}
        contentStyle={{ width: "auto" }}
        arrow={false}
      >
        <div className={css.popup}>
          <QueryHandler
            result={res}
            render={data => (
              <ul>
                {data.storedConnections.map(connection => {
                  return (
                    <Item
                      conn={connection}
                      key={connection.name}
                      className={css.item}
                    />
                  );
                })}
              </ul>
            )}
          />
          <Link href="/connections" className={css.newConnection}>
            <BiPencil /> Edit connections
          </Link>
        </div>
      </ButtonWithPopup>
    </div>
  );
}
