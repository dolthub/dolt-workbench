import DefinitionList from "@components/DefinitionList";
import TableList from "@components/TableList";
import Views from "@components/Views";
import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useTabsContext,
} from "@dolthub/react-components";
import { DatabasePageParams, OptionalRefParams } from "@lib/params";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  className?: string;
  params: DatabasePageParams;
};

const tabs = ["Tables", "Views", "Definitions"];

export default function NavLinks({ className, params }: Props) {
  const router = useRouter();
  const initialActiveIndex = getActiveIndexFromRouterQuery(router.query.active);

  return (
    <div data-cy="db-page-table-nav" className={className}>
      <Tabs initialActiveIndex={initialActiveIndex}>
        <TabList className={css.tabList}>
          {tabs.map((tab, i) => (
            <TabItem key={tab} tab={tab} index={i} />
          ))}
        </TabList>
        <CustomTabPanel
          index={0}
          params={params}
          name="tables"
          renderChildren={refName => (
            <TableList
              params={{
                ...params,
                refName,
              }}
            />
          )}
        />
        <CustomTabPanel
          index={1}
          params={params}
          name="views"
          renderChildren={refName => <Views params={{ ...params, refName }} />}
        />
        <CustomTabPanel
          index={2}
          name="definitions"
          params={params}
          renderChildren={refName => (
            <DefinitionList params={{ ...params, refName }} />
          )}
        />
      </Tabs>
    </div>
  );
}

type PanelProps = {
  renderChildren: (refName: string) => ReactNode;
  params: OptionalRefParams;
  name: string;
  index: number;
};

function CustomTabPanel(props: PanelProps) {
  return (
    <TabPanel index={props.index} className={css.tabPanel}>
      {props.params.refName ? (
        props.renderChildren(props.params.refName)
      ) : (
        <p className={css.empty} data-cy={`db-${props.name}-empty`}>
          No {props.name} to show
        </p>
      )}
    </TabPanel>
  );
}

function getActiveIndexFromRouterQuery(
  activeQuery: string | string[] | undefined,
): number {
  switch (activeQuery) {
    case "Tables":
      return 0;
    case "Views":
      return 1;
    case "Definitions":
      return 2;
    default:
      return 0;
  }
}

type TabItemProps = {
  tab: string;
  index: number;
};

function TabItem({ index, tab }: TabItemProps) {
  const { activeTabIndex } = useTabsContext();
  return (
    <Tab
      name={tab.toLowerCase()}
      index={index}
      className={cx(css.tab, { [css.active]: index === activeTabIndex })}
    >
      {tab}
    </Tab>
  );
}
