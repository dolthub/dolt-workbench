import {
  Button,
  FormInput,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import { SyntheticEvent } from "react";

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
  const handleClose = () => {
    onGroupNameChange("");
    onClose();
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onCreateGroup();
    }
  };

  return (
    <ModalOuter
      isOpen={isOpen}
      onRequestClose={handleClose}
      title="Create New Test Group"
    >
      <form onSubmit={handleSubmit}>
        <ModalInner>
          <FormInput
            value={groupName}
            label="Group Name"
            onChangeString={onGroupNameChange}
            placeholder="Choose a name for your test group"
            light
          />
        </ModalInner>
        <ModalButtons onRequestClose={handleClose}>
          <Button type="submit" disabled={!groupName.trim()}>
            Create
          </Button>
        </ModalButtons>
      </form>
    </ModalOuter>
  );
}
