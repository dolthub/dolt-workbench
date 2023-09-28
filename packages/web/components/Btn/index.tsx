import cx from "classnames";
import { ButtonHTMLAttributes } from "react";
import css from "./index.module.css";

// Default button with no styling except for transparent background. This was
// created due to this tailwind issue
// https://github.com/tailwindlabs/tailwindcss/discussions/5969
// We do not want to apply transparent backgrounds to buttons globally because it affects the
// background of buttons of other colors in local development.
export default function Btn({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx(css.btn, className)} type="button" {...props}>
      {children}
    </button>
  );
}
