import Button from "@components/Button";
import Loader from "@components/Loader";
import useViewList from "@components/Views/useViewList";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
  SchemaItemFragment,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { isDoltSystemTable } from "@lib/doltSystemTables";
import { TableParams } from "@lib/params";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import cx from "classnames";
import { ReactNode, useEffect, useState } from "react";
import TableType from "./TableType";
import css from "./index.module.css";
import { getDoltDiffQuery } from "./queryHelpers";
import { getTableColsFromQueryCols, isKeyless, queryShowingPKs } from "./utils";

type Props = {
  cidx: number;
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  doltDisabled?: boolean;
};

type InnerProps = Omit<Props, "doltDisabled"> & {
  disabled?: boolean;
  disabledPopup?: ReactNode;
  params: TableParams;
};

function Inner(props: InnerProps) {
  const currCol = props.columns[props.cidx];
  const { executeQuery } = useSqlEditorContext();
  const [submitting, setSubmitting] = useState(false);
  const isPK = currCol.isPrimaryKey;

  useEffect(() => {
    if (!submitting) {
      return;
    }
    const query = getDoltDiffQuery({ ...props, row: props.row, isPK });
    executeQuery({ ...props.params, query }).catch(console.error);
    setSubmitting(false);
  }, [submitting, props.params, executeQuery, isPK, props]);

  return (
    <div className={css.history}>
      <Loader loaded={!submitting} />
      <Button.Link
        onClick={() => setSubmitting(true)}
        className={css.button}
        disabled={props.disabled}
      >
        {isPK ? "Row History" : "Cell History"}
        {props.disabled && <BsFillQuestionCircleFill className={css.help} />}
      </Button.Link>
      <div className={css.popup}>{props.disabledPopup}</div>
    </div>
  );
}

export default function HistoryButton(props: Props): JSX.Element | null {
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const { views, loading } = useViewList(params);
  const isJoin = useQueryHasMultipleTables(params.q);

  if (loading) {
    return (
      <div className={cx(css.button, css.loading)}>Loading history...</div>
    );
  }

  if (!tableName) return null;

  const keyless = isKeyless(columns);
  const isView = getIsView(tableName, views);
  const isSystemTable = isDoltSystemTable(tableName);
  const pksShowing = queryShowingPKs(props.columns, columns);

  const disabled =
    props.doltDisabled ||
    keyless ||
    isView ||
    isSystemTable ||
    !columns ||
    // Need values of all PK columns to generate query for history
    !pksShowing ||
    // History will not work for joins
    isJoin;

  return (
    <Inner
      {...props}
      params={{ ...params, tableName }}
      columns={getTableColsFromQueryCols(props.columns, columns)}
      disabled={disabled}
      disabledPopup={
        <div className={css.notTable}>
          <Button.Link disabled>
            History not available{" "}
            <HistoryNotAvailableReason
              isView={isView}
              isSystemTable={isSystemTable}
              pksShowing={pksShowing}
              isJoin={isJoin}
              keyless={keyless}
              doltDisabled={props.doltDisabled}
            />
          </Button.Link>
        </div>
      }
    />
  );
}

function getIsView(tableName: string, views?: SchemaItemFragment[]): boolean {
  if (!views) return false;
  return views.some(v => v.name === tableName);
}

function useQueryHasMultipleTables(q?: string): boolean {
  const { parseSelectQuery } = useSqlParser();
  if (!q) return false;
  const parsed = parseSelectQuery(q);
  if (!parsed?.from) return false;
  return parsed.from.length > 1;
}

type ReasonProps = {
  isView: boolean;
  isSystemTable: boolean;
  pksShowing: boolean;
  isJoin: boolean;
  keyless: boolean;
  doltDisabled?: boolean;
};

function HistoryNotAvailableReason(props: ReasonProps) {
  if (props.doltDisabled) return <span>for non-Dolt databases.</span>;
  if (props.keyless) return <span>for keyless tables.</span>;
  if (props.isJoin) return <span>for multiple tables.</span>;
  if (!props.pksShowing) return <span>for partial primary keys.</span>;
  return (
    <TableType isView={props.isView} isDoltSystemTable={props.isSystemTable} />
  );
}
