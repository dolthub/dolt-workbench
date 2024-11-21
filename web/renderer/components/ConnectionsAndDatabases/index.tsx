import { QueryHandler, ButtonWithPopup } from "@dolthub/react-components";
import { useRef, useState } from "react";
import css from "./index.module.css";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { DatabaseParams } from "@lib/params";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import Inner from "./Inner";
import useSelectedConnection from "./useSelectedConnection";

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
      render={data => (
        <div className={css.connections}>
          <span className={css.label}>
            {res.data?.currentConnection?.name} / {params.databaseName}
          </span>
          <ButtonWithPopup
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            position="bottom left"
            offsetX={-80}
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
      )}
    />
  );
}
