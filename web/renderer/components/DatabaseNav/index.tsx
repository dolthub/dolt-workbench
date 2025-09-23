import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Tooltip } from "@dolthub/react-components";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { OptionalRefParams } from "@lib/params";
import NavItem from "./Item";
import Wrapper from "./Wrapper";
import css from "./index.module.css";
import { tabs } from "./tabs";

type Props = {
  params: OptionalRefParams & {
    tableName?: string;
    active?: string;
  };
  initialTabIndex: number;
};

export default function DatabaseNav(props: Props) {
  return (
    <Wrapper
      params={props.params}
      renderChild={params => <Inner {...props} params={params} />}
    />
  );
}

function Inner(props: Props) {
  const { isDolt, isPostgres } = useDatabaseDetails();
  
  return (
    <div data-cy="db-page-header-nav" className={css.headerNav}>
      <Tooltip id="disabled-database-nav-item" />
      <ul className={css.tabs}>
        {tabs.map((tab, i) => {
          // Hide Tests tab for doltgres databases for now
          if (tab === "Tests" && isDolt && isPostgres) {
            return null;
          }
          
          const item = <NavItem {...props} key={tab} name={tab} i={i} />;
          if (tab === "Database") {
            return item;
          }
          return <NotDoltWrapper key={tab}>{item}</NotDoltWrapper>;
        })}
      </ul>
    </div>
  );
}
