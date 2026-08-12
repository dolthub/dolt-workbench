import { useApolloClient } from "@apollo/client";
import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import {
  DoltCommitDiffDocument,
  DoltCommitDiffQuery,
  DoltCommitDiffQueryVariables,
  useDoltCommitDiffQuery,
} from "@gen/graphql-types";
import useDoltLookupRows from "@hooks/useDoltLookupRows";
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

  const variables = {
    databaseName: props.params.databaseName,
    refName: props.params.refName,
    schemaName: ctx?.schemaName,
    tableName: ctx?.tableName ?? "",
    fromCommitId: ctx?.fromCommitId ?? "",
    toCommitId: ctx?.toCommitId ?? "",
    excludedColumns: ctx?.excludedColumns,
    type: ctx?.type,
  };
  const res = useDoltCommitDiffQuery({
    variables,
    skip: !ctx,
  });
  const data = res.data?.doltCommitDiff;

  const client = useApolloClient();
  const { rows, loadMore, hasMore, err } = useDoltLookupRows(
    data,
    async offset => {
      const page = await client.query<
        DoltCommitDiffQuery,
        DoltCommitDiffQueryVariables
      >({
        query: DoltCommitDiffDocument,
        variables: { ...variables, offset },
      });
      return page.data.doltCommitDiff;
    },
  );

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
    <DataTableLayout params={{ ...props.params, q: data?.queryString ?? "" }}>
      <InnerDataTable
        rows={rows}
        columns={data?.columns}
        loadMore={loadMore}
        hasMore={hasMore}
        error={res.error ?? err}
      />
    </DataTableLayout>
  );
}
