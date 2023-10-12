import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import Loader from "@components/Loader";
import Modal from "@components/Modal";
import useEditDoc from "@hooks/useEditDoc";
import { ModalProps } from "@lib/modalProps";
import { DocParams } from "@lib/params";
import toDocType from "@lib/toDocType";

type Props = ModalProps & {
  params: DocParams;
};

export default function DeleteModal(props: Props) {
  const { onSubmit, loading, error } = useEditDoc(
    props.params,
    toDocType(props.params.docName),
  );

  const onClose = () => {
    props.setIsOpen(false);
  };

  return (
    <Modal
      {...props}
      onRequestClose={onClose}
      title={`Delete ${props.params.docName}`}
    >
      <Loader loaded={!loading} />
      <p>Are you sure you want to delete {props.params.docName}?</p>
      <ButtonsWithError onCancel={onClose} error={error}>
        <Button onClick={onSubmit} red data-cy="confirm-delete-docs-button">
          Delete
        </Button>
      </ButtonsWithError>
    </Modal>
  );
}
