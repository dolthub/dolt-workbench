import Link from "@components/links/Link";
import { Route } from "@dolthub/web-utils";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: string;
  url: Route;
  icon: ReactNode;
  hide?: boolean;
  ["data-cy"]?: string;
  doltDisabled?: boolean;
};

export default function DropdownItem(props: Props) {
  if (props.hide) return null;
  if (props.doltDisabled) {
    return (
      <li
        className={cx(css.popupItem, css.disabledItem)}
        data-cy={props["data-cy"]}
      >
        <span>{props.icon}</span>
        {props.children}
      </li>
    );
  }
  return (
    <li className={css.popupItem} data-cy={props["data-cy"]}>
      <Link {...props.url}>
        <span>{props.icon}</span>
        {props.children}
      </Link>
    </li>
  );
}
