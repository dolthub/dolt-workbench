import { QueryHandler, ButtonWithPopup } from "@dolthub/react-components";
import Link from "@components/links/Link";
import { useRef, useState } from "react";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import css from "./index.module.css";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { DatabaseParams } from "@lib/params";
import useSelectedConnection from "./useSelectedConnection";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import Inner from "./Inner";

type Props = {
  params: DatabaseParams;
};

export default function ConnectionsAndDatabases({ params }: Props) {
  const { databases, loading, err, storedConnections } =
    useSelectedConnection();
  const res = useCurrentConnectionQuery();
  const [isOpen, setIsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(connectionsRef, () => {
    setIsOpen(false);
  });
  console.log(databases,storedConnections,res)
  return (
    <QueryHandler
      result={{ ...res, data: res.data }}
      render={data => (
        <div className={css.connections}>
          <span className={css.label}>
            {res.data?.currentConnection?.name} / {params.databaseName}
          </span>
          <ButtonWithPopup
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            position="bottom center"
            offsetX={0}
            contentStyle={{ width: "auto" }}
            arrow={false}
          >
            <div className={css.popup} ref={connectionsRef}>
              {storedConnections && (
                <Inner
                  storedConnections={storedConnections}
                  params={params}
                  databases={databases}
                  currentConnection={data.currentConnection}
                />
              )}
              <Link href="/connections" className={css.newConnection}>
                <BiPencil /> Edit connections
              </Link>
            </div>
          </ButtonWithPopup>
        </div>
      )}
    />
  );
}
