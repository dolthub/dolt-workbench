import { ReactNode } from "react";
import { useTabsContext } from "./context";

type Props = {
  children: ReactNode;
  className?: string;
  index: number;
};

export default function TabPanel(props: Props) {
  const { activeTabIndex } = useTabsContext();
  if (props.index !== activeTabIndex) return null;
  return <div className={props.className}>{props.children}</div>;
}
