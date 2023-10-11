import Loader from "@components/Loader";
import SchemaList from "@components/SchemaList";
import TableList from "@components/TableList";
import { Tab, TabList, TabPanel } from "@components/Tabs";
import { TabsProvider } from "@components/Tabs/context";
import Views from "@components/Views";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import useIsDolt from "@hooks/useIsDolt";
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
  const { hideDoltFeature, loading } = useIsDolt();
  const tabs = ["Tables", "Schemas", "Views"];

  return (
    <div data-cy="db-page-table-nav" className={className}>
      <TabsProvider initialActiveIndex={initialActiveIndex}>
        <Loader loaded={!loading}>
          <TabList className={css.tabList}>
            {tabs.map((tab, i) => {
              if (hideDoltFeature && tab === "Views") return null;
              return (
                <Tab key={tab} data-cy={`tab-${tab.toLowerCase()}`} index={i}>
                  {tab}
                </Tab>
              );
            })}
          </TabList>
        </Loader>
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
        <CustomTabPanel index={2}>
          {params.refName ? (
            <NotDoltWrapper showNotDoltMsg feature="Listing views">
              <Views params={{ ...params, refName: params.refName }} />
            </NotDoltWrapper>
          ) : (
            <p className={css.empty} data-cy="db-views-empty">
              No views to show
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
    case "Views":
      return 2;
    default:
      return 0;
  }
}
