import Btn from "@dsw/components/Btn";
import Link from "@dsw/components/links/Link";
import { Route } from "@dsw/lib/urlUtils";
import cx from "classnames";
import { ReactNode } from "react";
import { useTabsContext } from "./context";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  index: number;
  ["data-cy"]?: string;
  routeTo?: Route;
};

export default function Tab(props: Props) {
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();
  const isActive = props.index === activeTabIndex;
  return (
    <li
      data-cy={
        isActive ? `active-${props["data-cy"] ?? "tab"}` : props["data-cy"]
      }
      aria-label={isActive ? "active-tab" : "tab"}
      className={cx(css.tab, props.className, {
        [css.activeTab]: isActive,
      })}
    >
      {props.routeTo ? (
        <Link {...props.routeTo}>{props.children}</Link>
      ) : (
        <Btn onClick={() => setActiveTabIndex(props.index)}>
          {props.children}
        </Btn>
      )}
    </li>
  );
}
