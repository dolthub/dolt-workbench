import useViewList from "@components/Views/useViewList";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, Loader } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  ColumnValueInput,
  RowForDataTableFragment,
  SchemaItemFragment,
  useDoltCellDiffLazyQuery,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { encodeCellHistory } from "@lib/cellHistoryUrl";
import { isDoltSystemTable } from "@lib/doltSystemTables";
import { TableOptionalSchemaParams } from "@lib/params";
import { query } from "@lib/urls";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import cx from "classnames";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import TableType from "./TableType";
import css from "./index.module.css";
import {
  convertTimestamp,
  getTableColsFromQueryCols,
  isKeyless,
  queryShowingPKs,
} from "./utils";

type Props = {
  cidx: number;
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  doltDisabled?: boolean;
};

type InnerProps = Omit<Props, "doltDisabled"> & {
  disabled?: boolean;
  disabledPopup?: ReactNode;
  params: TableOptionalSchemaParams;
};

function Inner(props: InnerProps) {
  const router = useRouter();
  const { setError } = useSqlEditorContext();
  const currCol = props.columns[props.cidx];
  const [fetchDoltCellDiff, { loading }] = useDoltCellDiffLazyQuery();
  const isPK = currCol.isPrimaryKey;

  const onClick = async () => {
    const pkValues = toPkValues(props.columns, props.row);
    const columnName = isPK ? undefined : currCol.name;
    const res = await fetchDoltCellDiff({
      variables: {
        databaseName: props.params.databaseName,
        refName: props.params.refName,
        schemaName: props.params.schemaName,
        tableName: props.params.tableName,
        pkValues,
        columnName,
      },
    });
    if (res.error) {
      setError(res.error);
      return;
    }
    const sql = res.data?.doltCellDiff;
    if (!sql) return;
    const historyParams = encodeCellHistory({
      tableName: props.params.tableName,
      schemaName: props.params.schemaName,
      pkValues,
      columnName,
    });
    const baseRoute = query(props.params);
    const pushQuery = {
      q: sql,
      schemaName: props.params.schemaName,
      ...historyParams,
    };
    router
      .push(
        { pathname: baseRoute.hrefPathname(), query: pushQuery },
        { pathname: baseRoute.asPathname(), query: pushQuery },
      )
      .catch(console.error);
  };

  return (
    <span className={css.history}>
      <Loader loaded={!loading} />
      <Button.Link
        onClick={onClick}
        className={css.button}
        disabled={props.disabled || loading}
      >
        {isPK ? "Row History" : "Cell History"}
        {props.disabled && <BsFillQuestionCircleFill className={css.help} />}
      </Button.Link>
      {props.disabled && (
        <span className={css.popup}>{props.disabledPopup}</span>
      )}
    </span>
  );
}

export default function HistoryButton(props: Props): JSX.Element | null {
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const { views, loading } = useViewList(params);
  const isJoin = useQueryHasMultipleTables(params.q);

  if (loading) {
    return (
      <span className={cx(css.button, css.loading)}>Loading history...</span>
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
    !pksShowing ||
    isJoin;

  return (
    <Inner
      {...props}
      params={{ ...params, tableName }}
      columns={getTableColsFromQueryCols(props.columns, columns)}
      disabled={disabled}
      disabledPopup={
        <span className={css.notTable}>
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
        </span>
      }
    />
  );
}

function toPkValues(
  cols: ColumnForDataTableFragment[],
  row: RowForDataTableFragment,
): ColumnValueInput[] {
  return cols
    .map((col, i) => {
      return { col, value: row.columnValues[i].displayValue };
    })
    .filter(c => c.col.isPrimaryKey)
    .map(({ col, value }) => {
      return {
        column: col.name,
        value: col.type === "TIMESTAMP" ? convertTimestamp(value) : value,
        type: col.type,
      };
    });
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
