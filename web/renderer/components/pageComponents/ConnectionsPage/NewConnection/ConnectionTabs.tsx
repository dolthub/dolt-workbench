import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useTabsContext,
} from "@dolthub/react-components";
import cx from "classnames";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { ReactNode } from "react";
import About from "./About";
import Connection from "./Connection";
import Advanced from "./Advanced";
import css from "./index.module.css";

export default function ConnectionTabs() {
  return (
    <Tabs initialActiveIndex={0}>
      <TabList className={css.tabList}>
        {["About", "Connection", "Advanced"].map((tab, i) => (
          <CustomTab key={tab} index={i}>
            {tab}
          </CustomTab>
        ))}
      </TabList>
      <CustomTabPanel index={0}>
        <About />
      </CustomTabPanel>
      <CustomTabPanel index={1}>
        <Connection />
      </CustomTabPanel>
      <CustomTabPanel index={2}>
        <Advanced />
      </CustomTabPanel>
    </Tabs>
  );
}

type PanelProps = {
  index: number;
  children: ReactNode;
};

function CustomTabPanel(props: PanelProps) {
  return (
    <TabPanel index={props.index} className={css.panel}>
      {props.children}
    </TabPanel>
  );
}

function CustomTab(props: { index: number; children: string }) {
  const { activeTabIndex } = useTabsContext();
  const isActive = props.index === activeTabIndex;
  const isCompleted = props.index < activeTabIndex;
  return (
    <Tab
      index={props.index}
      className={cx(css.tab, {
        [css.activeTab]: isActive,
        [css.isCompleted]: isCompleted,
      })}
    >
      {isCompleted && <FiCheck className={css.check} />}
      {props.children}
    </Tab>
  );
}
