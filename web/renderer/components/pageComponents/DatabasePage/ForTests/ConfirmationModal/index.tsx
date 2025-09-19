import {
  Button,
  ModalButtons,
  ModalInner,
  ModalOuter,
} from "@dolthub/react-components";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  return (
    <ModalOuter isOpen={isOpen} onRequestClose={onCancel} title={title}>
      <ModalInner className={css.modalInner}>
        <p className={css.message}>{message}</p>
      </ModalInner>
      <ModalButtons onRequestClose={onCancel}>
        <Button onClick={onConfirm} red={destructive} green={!destructive}>
          {confirmText}
        </Button>
      </ModalButtons>
    </ModalOuter>
  );
}
