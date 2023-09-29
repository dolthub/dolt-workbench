import cx from "classnames";
import { ReactNode } from "react";
import css from "../index.module.css";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  ["data-cy"]?: string;
};

export default function ExternalLink({ className, ...props }: Props) {
  return (
    <a
      {...props}
      className={cx(css.link, className)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
}
