import Link from "@components/links/Link";
import { Route } from "@lib/urlUtils";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: string;
  url: Route;
  icon: ReactNode;
  hide?: boolean;
  ["data-cy"]?: string;
};

export default function DropdownItem(props: Props) {
  if (props.hide) return null;
  return (
    <li className={css.popupItem} data-cy={props["data-cy"]}>
      <Link {...props.url}>
        <span>{props.icon}</span>
        {props.children}
      </Link>
    </li>
  );
}
