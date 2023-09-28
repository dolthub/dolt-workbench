import { ReactNode } from "react";
import { TabsProvider } from "./context";
import Tab from "./Tab";
import TabList from "./TabList";
import TabPanel from "./TabPanel";

type Props = {
  children: ReactNode[];
  initialActiveIndex?: number;
};

function Tabs({ children, ...props }: Props) {
  return (
    <TabsProvider {...props}>
      <div>{children}</div>
    </TabsProvider>
  );
}

export { Tabs, Tab, TabList, TabPanel };
