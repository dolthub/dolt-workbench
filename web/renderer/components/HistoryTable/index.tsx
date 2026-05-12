import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import {
  useDoltCellDiffQuery,
  useDoltCellHistoryQuery,
} from "@gen/graphql-types";
import { parseCellHistory } from "@lib/cellHistoryUrl";
import { SqlQueryParams } from "@lib/params";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

const ALL_COMMITS = "allCommits";

export default function HistoryTable(props: Props) {
  const router = useRouter();
  const { setEditorString } = useSqlEditorContext();
  const allCommits = router.query.historyMode === ALL_COMMITS;

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

  const variables = {
    databaseName: props.params.databaseName,
    refName: props.params.refName,
    schemaName: ctx?.schemaName,
    tableName: ctx?.tableName ?? "",
    pkValues: ctx?.pkValues ?? [],
    columnName: ctx?.columnName,
  };

  const diffRes = useDoltCellDiffQuery({
    variables,
    skip: !ctx || allCommits,
  });
  const historyRes = useDoltCellHistoryQuery({
    variables,
    skip: !ctx || !allCommits,
  });
  const res = allCommits ? historyRes : diffRes;
  const data = allCommits
    ? historyRes.data?.doltCellHistory
    : diffRes.data?.doltCellDiff;

  useEffect(() => {
    if (data?.queryString) setEditorString(data.queryString);
  }, [data?.queryString, setEditorString]);

  if (!ctx) {
    return (
      <ErrorMsg
        errString="Cannot generate history query for this view. Click Row or Cell History from a table view to enable this."
        className={css.err}
      />
    );
  }

  if (res.loading) return <Loader loaded={false} />;

  const forRow = !ctx.columnName;
  const onSeeAllClick = async () => {
    const nextQuery = { ...router.query, historyMode: ALL_COMMITS };
    await router.push({ pathname: router.pathname, query: nextQuery });
  };

  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          params={props.params}
          rows={data?.rows.list}
          columns={data?.columns}
          loadMore={async () => {}}
          hasMore={false}
          error={res.error}
        />
      </DataTableLayout>
      {!allCommits && (
        <Button.Link className={css.seeAll} onClick={onSeeAllClick}>
          See all commits including ones that did not change this{" "}
          {forRow ? "row" : "cell"}
        </Button.Link>
      )}
    </>
  );
}
