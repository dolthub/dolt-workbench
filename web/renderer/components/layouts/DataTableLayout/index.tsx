import DatabaseOptionsDropdown from "@components/DatabaseOptionsDropdown";
import StatusWithOptions from "@components/StatusWithOptions";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { SqlQueryParams } from "@lib/params";
import { ReactNode } from "react";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { useDataTableContext } from "@contexts/dataTable";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  params: SqlQueryParams;
  tableName?: string;
};

export default function DataTableLayout(props: Props) {
  const { onAddRow, pendingRow } = useDataTableContext();

  return (
    <div className={css.container}>
      {props.children}
      <div className={css.top}>
        <NotDoltWrapper hideNotDolt>
          <StatusWithOptions {...props} className={css.status} />
        </NotDoltWrapper>
        {props.tableName && !isUneditableDoltSystemTable(props.tableName) && (
          <HideForNoWritesWrapper params={props.params}>
            <Button.Outlined
              onClick={onAddRow}
              className={css.addRowButton}
              disabled={!!pendingRow?.columnValues.length}
            >
              Add row
            </Button.Outlined>
          </HideForNoWritesWrapper>
        )}
        <DatabaseOptionsDropdown
          className={css.optionsButton}
          params={props.params}
          tableName={props.tableName}
        />
      </div>
    </div>
  );
}
