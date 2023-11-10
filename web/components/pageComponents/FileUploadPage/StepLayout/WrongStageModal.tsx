import Button from "@components/Button";
import Modal from "@components/Modal";
import Link from "@components/links/Link";
import { ModalProps } from "@lib/modalProps";
import { upload } from "@lib/urls";
import { useFileUploadContext } from "../contexts/fileUploadLocalForage";
import css from "./index.module.css";

export default function WrongStageModal(props: ModalProps) {
  const { dbParams } = useFileUploadContext();
  return (
    <Modal
      title="This page is stale"
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
    >
      <div className={css.modal}>
        <p>
          We did not find the expected information on this page. Please start
          the file upload process from the beginning.
        </p>
        <Link {...upload(dbParams)}>
          <Button>Start over</Button>
        </Link>
      </div>
    </Modal>
  );
}
