import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function TabList(props: Props) {
  return <ul className={cx(css.tabList, props.className)}>{props.children}</ul>;
}
