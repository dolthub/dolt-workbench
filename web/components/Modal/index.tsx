import { Btn, Button, ErrorMsg } from "@dolthub/react-components";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { ApolloErrorType } from "@lib/errors/types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import cx from "classnames";
import { ReactNode, useRef } from "react";
import css from "./index.module.css";

type ButtonProps = {
  onRequestClose: () => void | Promise<void>;
  children?: ReactNode;
  err?: ApolloErrorType;
};

type OuterProps = {
  onRequestClose: () => void | Promise<void>;
  children: ReactNode;
  title: string;
  className?: string;
  overlayClassName?: string;
  isOpen: boolean;
};

type Props = OuterProps & {
  button?: ReactNode;
  err?: ApolloErrorType;
};

function Inner(props: Omit<OuterProps, "isOpen">) {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, props.onRequestClose);

  return (
    <div className={cx(css.overlay, props.overlayClassName)}>
      <div
        className={cx(css.modal, props.className)}
        ref={modalRef}
        role="dialog"
      >
        <div className={css.top}>
          <h3 data-cy="modal-title">{props.title}</h3>
          <Btn
            className={css.close}
            onClick={props.onRequestClose}
            data-cy="close-modal"
          >
            <span aria-label="close">
              <IoMdClose />
            </span>
          </Btn>
        </div>
        <div>{props.children}</div>
      </div>
    </div>
  );
}

export function ModalOuter(props: OuterProps) {
  if (!props.isOpen) return null;
  return <Inner {...props} />;
}

export function ModalInner(props: { children: ReactNode; className?: string }) {
  return <div className={cx(css.inner, props.className)}>{props.children}</div>;
}

export function ModalButtons(props: ButtonProps) {
  return (
    <div className={css.buttons} data-cy="modal-buttons">
      <ErrorMsg className={css.error} err={props.err} />
      <Button.Group>
        <Button.Link className={css.cancel} onClick={props.onRequestClose}>
          Cancel
        </Button.Link>
        {props.children ?? <Button onClick={props.onRequestClose}>OK</Button>}
      </Button.Group>
    </div>
  );
}

export default function Modal({ children, ...props }: Props) {
  if (!props.isOpen) return null;
  return (
    <ModalOuter {...props}>
      <ModalInner>{children}</ModalInner>
      <ModalButtons {...props}>{props.button}</ModalButtons>
    </ModalOuter>
  );
}
