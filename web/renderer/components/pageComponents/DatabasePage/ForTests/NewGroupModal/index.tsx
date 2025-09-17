import { Button } from "@dolthub/react-components";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  onCreateGroup: () => void;
  onClose: () => void;
};

export default function NewGroupModal({
  isOpen,
  groupName,
  onGroupNameChange,
  onCreateGroup,
  onClose,
}: Props) {
  if (!isOpen) return null;

  const handleClose = () => {
    onGroupNameChange("");
    onClose();
  };

  return (
    <div className={css.overlay}>
      <div className={css.modal}>
        <h3 className={css.title}>Create New Test Group</h3>
        <input
          type="text"
          className={css.fieldInput}
          value={groupName}
          onChange={e => onGroupNameChange(e.target.value)}
          placeholder="Enter group name..."
          onKeyDown={e => e.key === "Enter" && onCreateGroup()}
        />
        <div className={css.buttonGroup}>
          <Button onClick={onCreateGroup} disabled={!groupName.trim()}>
            Create
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
