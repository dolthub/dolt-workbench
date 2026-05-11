import SqlDataTable from "@components/SqlDataTable";
import { CellHistoryContext } from "@components/CellButtons/HistoryButton";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { useDoltCellHistoryLazyQuery } from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

export default function HistoryTable(props: Props) {
  const router = useRouter();
  const { executeQuery } = useSqlEditorContext();
  const [err, setErr] = useState("");
  const [fetchDoltCellHistory, { loading }] = useDoltCellHistoryLazyQuery();

  const ctx = useMemo(
    () => parseCellHistoryContext(router.query.cellHistoryContext),
    [router.query.cellHistoryContext],
  );
  const forRow = !ctx?.columnName;

  const onClick = async () => {
    if (!ctx) {
      setErr(
        "Cannot generate history query for this view. Click Row or Cell History from a table view to enable this.",
      );
      return;
    }
    const res = await fetchDoltCellHistory({
      variables: {
        databaseName: props.params.databaseName,
        refName: props.params.refName,
        schemaName: ctx.schemaName,
        tableName: ctx.tableName,
        pkValues: ctx.pkValues,
        columnName: ctx.columnName,
      },
    });
    if (res.error) {
      setErr(res.error.message);
      return;
    }
    const sql = res.data?.doltCellHistory;
    if (!sql) {
      setErr("Error generating history query.");
      return;
    }
    await executeQuery({ ...props.params, query: sql });
  };

  return (
    <div>
      <SqlDataTable {...props} />
      <Button.Link
        className={css.seeAll}
        onClick={onClick}
        disabled={!ctx || loading}
      >
        See all commits including ones that did not change this{" "}
        {forRow ? "row" : "cell"}
      </Button.Link>
      <ErrorMsg errString={err} className={css.err} />
    </div>
  );
}

function parseCellHistoryContext(
  raw: string | string[] | undefined,
): CellHistoryContext | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    return JSON.parse(raw) as CellHistoryContext;
  } catch {
    return undefined;
  }
}
