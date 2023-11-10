import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  icon: ReactNode;
  link: ReactNode;
  disabled?: boolean;
};

export default function OptionSquare(props: Props) {
  return (
    <div className={cx(css.square, { [css.disabledSquare]: !!props.disabled })}>
      {props.icon}
      {props.link}
    </div>
  );
}
