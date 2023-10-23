import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function CustomRadio({ disabled = false, ...props }: Props) {
  return (
    <label
      className={cx(css.container, props.className, {
        [css.disabled]: disabled,
      })}
      htmlFor={props.name}
      data-cy={`radio-${props.name.toLowerCase()}`}
    >
      {props.children}
      <input
        checked={props.checked}
        onChange={props.onChange}
        type="radio"
        id={props.name}
        disabled={disabled}
      />
      <span className={css.checkmark} />
    </label>
  );
}
