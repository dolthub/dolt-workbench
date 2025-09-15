import { Button } from "@dolthub/react-components";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { FaExclamationTriangle } from "@react-icons/all-files/fa/FaExclamationTriangle";
import css from "./ConfirmationModal.module.css";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={css.overlay} onClick={onCancel}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <div className={css.header}>
          <div className={css.headerLeft}>
            {destructive && <FaExclamationTriangle className={css.warningIcon} />}
            <h3 className={css.title}>{title}</h3>
          </div>
          <button className={css.closeButton} onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        
        <div className={css.body}>
          <p className={css.message}>{message}</p>
        </div>
        
        <div className={css.footer}>
          <Button onClick={onCancel} className={css.cancelButton}>
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            className={css.confirmButton}
            red={destructive}
            green={!destructive}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}