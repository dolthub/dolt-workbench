import DeleteModal from "@components/DeleteModal";
import { Button } from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  StoredConnectionsDocument,
  useRemoveConnectionMutation,
} from "@gen/graphql-types";
import { useRouter } from "next/router";
import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import { useState } from "react";
import { newConnection } from "@lib/urls";
import Item from "./Item";
import css from "./index.module.css";

type Props = {
  connections: DatabaseConnectionFragment[];
};

export default function ExistingConnections(props: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionNameToDelete, setConnectionNameToDelete] = useState("");

  const onDeleteClicked = (name: string) => {
    setConnectionNameToDelete(name);
    setDeleteModalOpen(true);
  };

  const router = useRouter();
  const onClick = () => {
    const { href, as } = newConnection;
    router.push(href, as).catch(console.error);
  };

  return (
    <div className={css.outer}>
      <div className={css.text}>
        <h3>Connections</h3>
        <p>
          Connect the workbench to any MySQL or PostgreSQL compatible database.
          Use <DoltLink /> or <DoltgresLink /> to unlock version control
          features.
        </p>
      </div>
      <div className={css.outerEllipse}>
        <div className={css.innerEllipse}>
          <img
            src="/images/d-large-logo.png"
            alt="Dolt Logo"
            className={css.dLogo}
          />
          <div className={css.leftLine} />
        </div>
      </div>

      <Button className={css.newConnection} onClick={onClick}>
        Add connection
      </Button>
      <div className={css.rightLine} />
      <ul>
        {props.connections.map((conn, i) => (
          <Item
            conn={conn}
            key={conn.name}
            onDeleteClicked={onDeleteClicked}
            borderClassName={getBorderLineClassName(
              props.connections.length,
              i,
            )}
          />
        ))}
      </ul>
      <DeleteModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        asset="connection"
        assetId={connectionNameToDelete}
        mutationProps={{
          hook: useRemoveConnectionMutation,
          variables: { name: connectionNameToDelete },
          refetchQueries: [{ query: StoredConnectionsDocument }],
        }}
      />
    </div>
  );
}

function getBorderLineClassName(n: number, ind: number): string {
  if (n % 2 === 0) {
    return ind < n / 2 ? "roundedTop" : "roundedBottom";
  }
  if (ind < Math.floor(n / 2)) {
    return "roundedTop";
  }
  if (ind > Math.floor(n / 2)) {
    return "roundedBottom";
  }
  return "straightLine";
}
