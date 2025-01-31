import DatabaseOptionsDropdown from "@components/DatabaseOptionsDropdown";
import StatusWithOptions from "@components/StatusWithOptions";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { SqlQueryParams } from "@lib/params";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  params: SqlQueryParams;
};

export default function DataTableLayout(props: Props) {
  return (
    <div className={css.container}>
      {props.children}
      <div className={css.top}>
        <NotDoltWrapper
          connectionName={props.params.connectionName}
          hideNotDolt
        >
          <StatusWithOptions {...props} className={css.status} />
        </NotDoltWrapper>
        <DatabaseOptionsDropdown
          className={css.optionsButton}
          params={props.params}
        />
      </div>
    </div>
  );
}
