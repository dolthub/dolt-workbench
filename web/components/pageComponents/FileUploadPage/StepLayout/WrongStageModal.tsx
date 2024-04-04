import Link from "@components/links/Link";
import { Button, Modal } from "@dolthub/react-components";
import { ModalProps } from "@lib/modalProps";
import { upload } from "@lib/urls";
import { useFileUploadContext } from "../contexts/fileUploadLocalForage";

export default function WrongStageModal(props: ModalProps) {
  const { dbParams } = useFileUploadContext();
  return (
    <Modal
      title="This page is stale"
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
      button={
        <Link {...upload(dbParams)}>
          <Button>Start over</Button>
        </Link>
      }
    >
      <div>
        <p>
          We did not find the expected information on this page. Please start
          the file upload process from the beginning.
        </p>
      </div>
    </Modal>
  );
}
