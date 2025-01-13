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
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
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
      <div>
        <h3>Connections</h3>
        <p className={css.text}>
          Connect the workbench to any MySQL or PostgreSQL compatible database.
          Use <DoltLink /> or <DoltgresLink /> to unlock version control
          features.
        </p>
      </div>

      <div className={css.options}>
        <ul>
          {props.connections.map(conn => (
            <Item
              conn={conn}
              key={conn.name}
              onDeleteClicked={onDeleteClicked}
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
        <Button className={css.newConnection} onClick={onClick}>
          <AiOutlinePlus /> New connection
        </Button>
      </div>
    </div>
  );
}
