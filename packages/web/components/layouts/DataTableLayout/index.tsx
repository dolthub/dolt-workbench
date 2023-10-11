import DatabaseOptionsDropdown from "@components/DatabaseOptionsDropdown";
import { SqlQueryParams } from "@lib/params";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  params: SqlQueryParams;
  // tableName?: string;
};

export default function DataTableLayout(props: Props) {
  return (
    <div className={css.container}>
      {props.children}
      <div className={css.top}>
        {/* <StatusWithOptions {...props} className={css.status} /> */}
        <DatabaseOptionsDropdown
          className={css.optionsButton}
          params={props.params}
        />
      </div>
    </div>
  );
}
