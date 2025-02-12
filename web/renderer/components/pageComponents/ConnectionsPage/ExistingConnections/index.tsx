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
  const [isLocalDolt, setIsLocalDolt] = useState(false);
  const [port,setPort]=useState("")

  const onDeleteClicked = (name: string, isLocalDolt: boolean,connectionPort:string ) => {
    setConnectionNameToDelete(name);
    setDeleteModalOpen(true);
    setIsLocalDolt(isLocalDolt);
    setPort(connectionPort)
  };

  const removeLocalDoltFolder = async (name: string,port:string) => {
    try {
      const result = await window.ipc.invoke("remove-dolt-connection", name,port);
      console.log(result);
    } catch (error) {
      console.error("Failed to remove local Dolt server:", error);
    }
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
        <h1>Connections</h1>
        <p>
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
        <Button className={css.newConnection} onClick={onClick}>
          Add Connection
        </Button>
        <div className={css.rightLine} />
        <ul>
          {props.connections.map((conn, i) => (
            <Item
              conn={conn}
              key={conn.name}
              onDeleteClicked={(name: string) =>
                onDeleteClicked(name, !!conn.isLocalDolt,conn.port||"")
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
            ? () => removeLocalDoltFolder(connectionNameToDelete,port)
            : undefined
        }
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
