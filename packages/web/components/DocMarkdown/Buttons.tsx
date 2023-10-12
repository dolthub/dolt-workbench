import Button from "@components/Button";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import { useState } from "react";
import DeleteModal from "./DeleteModal";
import css from "./index.module.css";
import { isDefaultDocOrDocNamesMatch } from "./utils";

type Props = {
  params: RefParams & { docName?: string };
  doltDocsQueryDocName?: string;
  showEditor: boolean;
  setShowEditor: (s: boolean) => void;
};

export default function Buttons(props: Props) {
  const [showModal, setShowModal] = useState(false);

  if (!props.params.docName) return null;

  if (
    !isDefaultDocOrDocNamesMatch(
      props.params.docName,
      props.doltDocsQueryDocName,
    )
  ) {
    return (
      <div className={css.buttons}>
        <Link {...newDoc(props.params)}>
          <Button>Add {props.params.docName}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Button.Group className={css.buttons}>
        <Button
          onClick={() => props.setShowEditor(!props.showEditor)}
          className={css.edit}
        >
          edit
        </Button>
        <Button.Underlined onClick={() => setShowModal(true)} red>
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
