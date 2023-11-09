import cx from "classnames";
import React from "react";
import css from "./index.module.css";

type Props = {
  label?: string;
  hasError?: boolean;
  light?: boolean;
  onChangeString?: (s: string) => void;
  horizontal?: boolean;
  description?: string;
  adjustForMobile?: boolean;
  pill?: boolean;
  labelClassName?: string;
  inputClassName?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

// eslint-disable-next-line prefer-arrow-callback
export default React.forwardRef<HTMLInputElement, Props>(function FormInput(
  {
    label,
    className,
    labelClassName,
    onChange,
    onChangeString,
    placeholder = "",
    hasError = false,
    light = false,
    horizontal = false,
    adjustForMobile = false,
    type = "text",
    description,
    pill,
    inputClassName,
    ...inputProps
  }: Props,
  ref,
) {
  return (
    <div
      className={cx(
        css.container,
        {
          [css.horizontal]: horizontal,
          [css.adjustForMobile]: adjustForMobile && !pill,
        },
        className,
      )}
      aria-label="form-input-container"
    >
      {label && (
        <div
          className={cx(
            css.label,
            { [css.horizontalLabel]: horizontal },
            labelClassName,
          )}
        >
          {label}
        </div>
      )}
      {description && <p className={css.description}>{description}</p>}
      <input
        {...inputProps}
        className={cx(css.input, inputClassName, {
          [css.error]: hasError,
          [css.bgwhite]: light,
          [css.pill]: pill,
        })}
        onChange={e =>
          onChangeString ? onChangeString(e.target.value) : onChange?.(e)
        }
        type={type}
        placeholder={placeholder}
        ref={ref}
      />
    </div>
  );
});
