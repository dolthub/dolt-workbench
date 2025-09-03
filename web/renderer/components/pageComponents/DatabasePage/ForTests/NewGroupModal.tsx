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
  onClose
}: Props) {
  if (!isOpen) return null;

  const handleClose = () => {
    onGroupNameChange("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Create New Test Group</h3>
        <input
          type="text"
          className={css.fieldInput}
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="Enter group name..."
          onKeyDown={(e) => e.key === 'Enter' && onCreateGroup()}
        />
        <div className="flex gap-2 mt-4">
          <Button onClick={onCreateGroup} disabled={!groupName.trim()}>
            Create
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}