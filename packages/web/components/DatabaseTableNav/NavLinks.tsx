import { Tab, TabList, TabPanel } from "@dsw/components/Tabs";
import { TabsProvider } from "@dsw/components/Tabs/context";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  className?: string;
};

export default function NavLinks({ className }: Props) {
  // const router = useRouter();
  // const initialActiveIndex = getActiveIndexFromRouterQuery(router.query.active);
  const tabs = ["Tables", "Schemas"];

  return (
    <div data-cy="db-page-table-nav" className={className}>
      <TabsProvider initialActiveIndex={0}>
        <TabList className={css.tabList}>
          {tabs.map((tab, i) => (
            <Tab key={tab} data-cy={`tab-${tab.toLowerCase()}`} index={i}>
              {tab}
            </Tab>
          ))}
        </TabList>
        <CustomTabPanel index={0}>
          <div>Table list</div>
        </CustomTabPanel>
        <CustomTabPanel index={1}>
          <div>Schema list</div>
        </CustomTabPanel>
      </TabsProvider>
    </div>
  );
}

function CustomTabPanel(props: { children: ReactNode; index: number }) {
  return (
    <TabPanel index={props.index} className={css.tabPanel}>
      {props.children}
    </TabPanel>
  );
}

function getActiveIndexFromRouterQuery(
  activeQuery: string | string[] | undefined,
): number {
  switch (activeQuery) {
    case "Tables":
      return 0;
    case "Schemas":
      return 1;
    default:
      return 0;
  }
}
