import SqlDataTable from "@components/SqlDataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { useDoltCellHistoryLazyQuery } from "@gen/graphql-types";
import { parseCellHistory } from "@lib/cellHistoryUrl";
import { SqlQueryParams } from "@lib/params";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

export default function HistoryTable(props: Props) {
  const router = useRouter();
  const { executeQuery, setError } = useSqlEditorContext();
  const [missingCtxErr, setMissingCtxErr] = useState("");
  const [fetchDoltCellHistory, { loading }] = useDoltCellHistoryLazyQuery();

  const ctx = useMemo(
    () => parseCellHistory(router.query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.historyTable,
      router.query.historySchema,
      router.query.historyPk,
      router.query.historyCell,
    ],
  );
  const forRow = !ctx?.columnName;

  const onClick = async () => {
    if (!ctx) {
      setMissingCtxErr(
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
      setError(res.error);
      return;
    }
    const sql = res.data?.doltCellHistory;
    if (!sql) return;
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
      <ErrorMsg errString={missingCtxErr} className={css.err} />
    </div>
  );
}
