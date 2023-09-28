import cx from "classnames";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React from "react";
import css from "./index.module.css";

export type LinkProps = {
  className?: string;
  ["aria-label"]?: string;
  external?: boolean;
};

type Props = React.PropsWithChildren<NextLinkProps> & LinkProps;

export default function Link({ external = false, ...props }: Props) {
  return (
    <NextLink
      {...props}
      aria-label={props["aria-label"]}
      className={cx(css.link, props.className)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {props.children}
    </NextLink>
  );
}
