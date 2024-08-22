import DefinitionList from "@components/DefinitionList";
import TableList from "@components/TableList";
import Views from "@components/Views";
import { Tab, TabList, TabPanel, Tabs } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  className?: string;
  params: OptionalRefParams & {
    schemaName?: string;
    tableName?: string;
    q?: string;
  };
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
            <Tab key={tab} name={tab.toLowerCase()} index={i} dark>
              {tab}
            </Tab>
          ))}
        </TabList>
        <CustomTabPanel
          index={0}
          params={params}
          name="tables"
          renderChildren={refName => (
            <TableList
              params={{
                databaseName: params.databaseName,
                tableName: params.tableName,
                refName,
                schemaName: params.schemaName,
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
