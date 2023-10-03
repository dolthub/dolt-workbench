import SchemaList from "@components/SchemaList";
import TableList from "@components/TableList";
import { Tab, TabList, TabPanel } from "@components/Tabs";
import { TabsProvider } from "@components/Tabs/context";
import { OptionalRefParams } from "@lib/params";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  className?: string;
  params: OptionalRefParams & {
    tableName?: string;
    q?: string;
  };
};

export default function NavLinks({ className, params }: Props) {
  const router = useRouter();
  const initialActiveIndex = getActiveIndexFromRouterQuery(router.query.active);
  const tabs = ["Tables", "Schemas"];

  return (
    <div data-cy="db-page-table-nav" className={className}>
      <TabsProvider initialActiveIndex={initialActiveIndex}>
        <TabList className={css.tabList}>
          {tabs.map((tab, i) => (
            <Tab key={tab} data-cy={`tab-${tab.toLowerCase()}`} index={i}>
              {tab}
            </Tab>
          ))}
        </TabList>
        <CustomTabPanel index={0}>
          {params.refName ? (
            <TableList
              params={{
                ...params,
                refName: params.refName,
              }}
            />
          ) : (
            <p className={css.empty} data-cy="db-tables-empty">
              No tables to show
            </p>
          )}
        </CustomTabPanel>
        <CustomTabPanel index={1}>
          {params.refName ? (
            <SchemaList params={{ ...params, refName: params.refName }} />
          ) : (
            <p className={css.empty} data-cy="db-schemas-empty">
              No schemas to show
            </p>
          )}
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
