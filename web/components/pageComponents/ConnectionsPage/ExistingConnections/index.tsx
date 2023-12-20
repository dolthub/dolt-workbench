import Button from "@components/Button";
import DeleteModal from "@components/DeleteModal";
import {
  DatabaseConnectionFragment,
  StoredConnectionsDocument,
  useRemoveConnectionMutation,
} from "@gen/graphql-types";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { useState } from "react";
import Item from "./Item";
import css from "./index.module.css";

type Props = {
  connections: DatabaseConnectionFragment[];
  setShowForm: (s: boolean) => void;
};

export default function ExistingConnections(props: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionNameToDelete, setConnectionNameToDelete] = useState("");

  const onDeleteClicked = (name: string) => {
    setConnectionNameToDelete(name);
    setDeleteModalOpen(true);
  };

  return (
    <div className={css.whiteContainer}>
      <h3>Connections</h3>
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
          title="Delete Connection"
          btnText="Delete connection"
          mutationProps={{
            hook: useRemoveConnectionMutation,
            variables: { name: connectionNameToDelete },
            refetchQueries: [{ query: StoredConnectionsDocument }],
          }}
        >
          <p>
            Are you sure you want to delete the &quot;{connectionNameToDelete}
            &quot; connection?
          </p>
        </DeleteModal>
        <Button
          onClick={() => props.setShowForm(true)}
          className={css.newConnection}
        >
          <AiOutlinePlus /> New connection
        </Button>
      </div>
    </div>
  );
}
