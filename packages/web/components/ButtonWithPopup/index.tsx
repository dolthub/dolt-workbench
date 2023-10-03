import Popup from "@components/Popup";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import cx from "classnames";
import { ReactNode } from "react";
import { PopupProps } from "reactjs-popup/dist/types";
import css from "./index.module.css";

type Props = Partial<PopupProps> & {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  triggerText?: string;
  buttonClassName?: string;
  ["data-cy"]?: string;
};

export default function ButtonWithPopup({
  children,
  isOpen,
  setIsOpen,
  triggerText,
  ...props
}: Props) {
  return (
    <Popup
      position="bottom right"
      on="click"
      offsetX={32}
      contentStyle={{ width: "10rem" }}
      closeOnDocumentClick
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      trigger={
        <button
          type="button"
          className={cx(
            css.triggerButton,
            { [css.withoutText]: !triggerText },
            props.buttonClassName,
          )}
          data-cy={props["data-cy"]}
        >
          {triggerText}
          {isOpen ? (
            <FaCaretUp
              className={cx(css.caret, {
                [css.caretWithoutText]: !triggerText,
              })}
            />
          ) : (
            <FaCaretDown
              className={cx(css.caret, {
                [css.caretWithoutText]: !triggerText,
              })}
            />
          )}
        </button>
      }
      // props must come last to override default props above
      {...props}
    >
      {children}
    </Popup>
  );
}
