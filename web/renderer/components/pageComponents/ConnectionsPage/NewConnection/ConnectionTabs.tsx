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
import { useConfigContext } from "./context/config";
import { ConfigState } from "./context/state";

export default function ConnectionTabs() {
  const { setErr } = useConfigContext();
  const clearErr = () => setErr(undefined);

  return (
    <Tabs initialActiveIndex={0} afterSetTabIndex={clearErr}>
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
  const { state } = useConfigContext();
  const isCompleted =
    props.index < activeTabIndex && getCompleted(props.children, state);
  return (
    <Tab
      index={props.index}
      className={cx(css.tab, {
        [css.activeTab]: isActive,
        [css.isCompleted]: isCompleted,
      })}
      disabled={getDisabled(props.children,state)}
    >
      {isCompleted && <FiCheck className={css.check} />}
      <span>{props.children}</span>
    </Tab>
  );
}

function getCompleted(tabName: string, state: ConfigState): boolean {
  switch (tabName) {
    case "About":
      return !!state.name;
    case "Connection":
      return !!state.connectionUrl || (!!state.host && !!state.username);
    default:
      return true;
  }
}

function getDisabled(tabName: string, state: ConfigState):boolean{
  switch (tabName) {
    case "Connection":
      return !state.name;
    case "Advanced":
      return !state.name||(!state.connectionUrl && (!state.host || !state.username));
    default:
      return false;
  }
}