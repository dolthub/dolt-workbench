import Button from "@components/Button";
import { RefParams } from "@lib/params";
import { useState } from "react";
import DeleteModal from "./DeleteModal";
import css from "./index.module.css";

type Props = {
  params: RefParams & { docName?: string };
  showEditor: boolean;
  setShowEditor: (s: boolean) => void;
};

export default function Buttons(props: Props) {
  const [showModal, setShowModal] = useState(false);

  if (!props.params.docName) return null;

  return (
    <div>
      <Button.Group className={css.buttons}>
        <Button
          onClick={() => props.setShowEditor(!props.showEditor)}
          className={css.edit}
          data-cy="edit-docs-button"
        >
          edit
        </Button>
        <Button.Underlined
          onClick={() => setShowModal(true)}
          red
          data-cy="delete-docs-button"
        >
          delete
        </Button.Underlined>
      </Button.Group>
      <DeleteModal
        isOpen={showModal}
        setIsOpen={setShowModal}
        params={{ ...props.params, docName: props.params.docName }}
      />
    </div>
  );
}
