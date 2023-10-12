import cx from "classnames";
import { forwardRef } from "react";
import css from "./index.module.css";

type Props = {
  label?: string;
  onChangeString?: (value: string) => void;
  hasError?: boolean;
  light?: boolean;
  inputref?: React.RefObject<HTMLTextAreaElement>;
  horizontal?: boolean;
} & React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

const Textarea = (
  {
    label,
    className,
    onChange,
    onChangeString,
    placeholder = "",
    hasError = false,
    light = false,
    horizontal = false,
    ...textAreaProps
  }: Props,
  ref: any,
) => (
  <div
    className={cx(css.container, className, { [css.horizontal]: horizontal })}
    aria-label="textarea-container"
    data-cy="textarea-container"
  >
    {label && <div className={css.label}>{label}</div>}
    <textarea
      {...textAreaProps}
      className={cx(css.textarea, {
        [css.error]: hasError,
        [css.bgwhite]: light,
      })}
      placeholder={placeholder}
      onChange={e =>
        onChangeString ? onChangeString(e.target.value) : onChange?.(e)
      }
      ref={ref}
      aria-label={textAreaProps["aria-label"] || "textarea"}
    />
  </div>
);

export default forwardRef<HTMLTextAreaElement, Props>(Textarea);
