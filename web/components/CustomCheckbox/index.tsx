import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import cx from "classnames";
import { ChangeEvent } from "react";
import css from "./index.module.css";

type Props = {
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  blue?: boolean;
};

export default function CustomCheckbox({
  className,
  blue = false,
  label,
  description,
  ...props
}: Props) {
  return (
    <div className={className} data-cy={`${props.name}-checkbox`}>
      <label
        className={cx(css.container, {
          [css.disabledContainer]: !!props.disabled,
          [css.blueContainer]: blue,
        })}
        htmlFor={props.name}
      >
        {label}
        <input {...props} id={props.name} type="checkbox" />
        <span className={css.checkmark}>
          <FiCheck />
        </span>
      </label>
      {description && <p className={css.description}>{description}</p>}
    </div>
  );
}
