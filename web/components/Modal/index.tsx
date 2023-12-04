import Btn from "@components/Btn";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import { ReactNode, useRef } from "react";
import css from "./index.module.css";

export type Props = {
  onRequestClose: () => void | Promise<void>;
  children: ReactNode;
  title?: string;
  className?: string;
  isOpen: boolean;
  overlayClassName?: string;
};

function Inner({ className, title, ...props }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, props.onRequestClose);

  return (
    <div className={cx(css.overlay, props.overlayClassName)}>
      <div className={cx(css.modal, className)} ref={modalRef} role="dialog">
        <Btn
          className={css.close}
          onClick={props.onRequestClose}
          data-cy="close-modal"
        >
          <span aria-label="close">
            <IoMdClose />
          </span>
        </Btn>
        <div className={css.inner}>
          {title && <h2 data-cy="modal-title">{title}</h2>}
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default function Modal(props: Props) {
  if (!props.isOpen) return null;
  return <Inner {...props} />;
}
