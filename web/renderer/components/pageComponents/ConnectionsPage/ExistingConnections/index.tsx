import DeleteModal from "@components/DeleteModal";
import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import { Button } from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  StoredConnectionsDocument,
  useRemoveConnectionMutation,
} from "@gen/graphql-types";
import { newConnection } from "@lib/urls";
import { useRouter } from "next/router";
import { useState } from "react";
import Item from "./Item";
import css from "./index.module.css";
import useTauri from "@hooks/useTauri";

type Props = {
  connections: DatabaseConnectionFragment[];
};

export default function ExistingConnections(props: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionNameToDelete, setConnectionNameToDelete] = useState("");
  const [isLocalDolt, setIsLocalDolt] = useState(false);
  const { removeDoltServer } = useTauri();
  const onDeleteClicked = (name: string, local: boolean) => {
    setConnectionNameToDelete(name);
    setDeleteModalOpen(true);
    setIsLocalDolt(local);
  };

  const removeLocalDoltFolder = async () => {
    try {
      if (process.env.NEXT_PUBLIC_FOR_ELECTRON === "true") {
        await window.ipc.invoke(
          "remove-dolt-connection",
          connectionNameToDelete,
        );
      } else if (process.env.NEXT_PUBLIC_FOR_TAURI === "true") {
        await removeDoltServer(connectionNameToDelete);
      }
    } catch (error) {
      console.error("Failed to remove local Dolt server:", error);
      return new Error(`Failed to remove local Dolt server: ${error}`);
    }
    return undefined;
  };

  const router = useRouter();
  const onClick = () => {
    const { href, as } = newConnection;
    router.push(href, as).catch(console.error);
  };

  const halfHeight = Math.floor(props.connections.length / 2) * 5;
  const marginTop = halfHeight < 10 ? `${12 - halfHeight}rem` : "0";

  return (
    <div className={css.outer}>
      <div className={css.text}>
        <h1 data-cy="connections-title">Connections</h1>
        <p data-cy="welcome-message">
          Connect the workbench to any MySQL or PostgreSQL compatible database.
          Use <DoltLink /> or <DoltgresLink /> to unlock version control
          features.
        </p>
      </div>
      <div className={css.connections} style={{ marginTop }}>
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
        <Button
          className={css.newConnection}
          onClick={onClick}
          data-cy="add-connection-button"
        >
          Add Connection
        </Button>
        <div className={css.rightLine} />
        <ul data-cy="connections-list">
          {props.connections.map((conn, i) => (
            <Item
              conn={conn}
              key={conn.name}
              onDeleteClicked={(name: string) =>
                onDeleteClicked(name, !!conn.isLocalDolt)
              }
              borderClassName={getBorderLineClassName(
                props.connections.length,
                i,
              )}
              shorterLine={props.connections.length === 2}
            />
          ))}
        </ul>
      </div>
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
        callback={
          isLocalDolt
            ? () => {
                removeLocalDoltFolder().catch(err => console.error(err));
                return undefined;
              }
            : undefined
        }
        alertMessage={
          isLocalDolt
            ? "This action will permanently delete the local Dolt server and all associated data stored within it. This cannot be undone."
            : undefined
        }
        buttonDataCy="delete-connection-confirm-button"
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
