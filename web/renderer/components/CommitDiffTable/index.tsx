import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import { useDoltCommitDiffQuery } from "@gen/graphql-types";
import { parseCommitDiff } from "@lib/commitDiffUrl";
import { SqlQueryParams } from "@lib/params";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

export default function CommitDiffTable(props: Props) {
  const router = useRouter();
  const { setEditorString } = useSqlEditorContext();

  const ctx = useMemo(
    () => parseCommitDiff(router.query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.commitDiffTable,
      router.query.commitDiffSchema,
      router.query.commitDiffFrom,
      router.query.commitDiffTo,
      router.query.commitDiffExclude,
      router.query.commitDiffType,
    ],
  );

  const res = useDoltCommitDiffQuery({
    variables: {
      databaseName: props.params.databaseName,
      refName: props.params.refName,
      schemaName: ctx?.schemaName,
      tableName: ctx?.tableName ?? "",
      fromCommitId: ctx?.fromCommitId ?? "",
      toCommitId: ctx?.toCommitId ?? "",
      excludedColumns: ctx?.excludedColumns,
      type: ctx?.type,
    },
    skip: !ctx,
  });
  const data = res.data?.doltCommitDiff;

  useEffect(() => {
    if (data?.queryString) setEditorString(data.queryString);
  }, [data?.queryString, setEditorString]);

  if (!ctx) {
    return (
      <ErrorMsg
        errString="Cannot display commit diff for this view. Click View SQL from a diff page to enable this."
        className={css.err}
      />
    );
  }

  if (res.loading) return <Loader loaded={false} />;

  return (
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
  );
}
