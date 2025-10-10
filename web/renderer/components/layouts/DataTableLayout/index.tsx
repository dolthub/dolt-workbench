import DatabaseOptionsDropdown from "@components/DatabaseOptionsDropdown";
import StatusWithOptions from "@components/StatusWithOptions";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { SqlQueryParams } from "@lib/params";
import { ReactNode } from "react";
import css from "./index.module.css";
import { useDataTableContext } from "@contexts/dataTable";

type Props = {
  children: ReactNode;
  params: SqlQueryParams;
  tableName?: string;
};

export default function DataTableLayout(props: Props) {
  const { diffExists, workingDiffRowsToggled, setWorkingDiffRowsToggled } =
    useDataTableContext();

  return (
    <div className={css.container}>
      {props.children}
      <div className={css.top}>
        <NotDoltWrapper hideNotDolt>
          <StatusWithOptions
            {...props}
            className={css.status}
            diffExists={diffExists}
            workingDiffRowsToggled={workingDiffRowsToggled}
            setWorkingDiffRowsToggled={setWorkingDiffRowsToggled}
          />
        </NotDoltWrapper>
        <DatabaseOptionsDropdown
          className={css.optionsButton}
          params={props.params}
          tableName={props.tableName}
        />
      </div>
    </div>
  );
}
