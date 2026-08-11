import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import { useSchemaDefinitionQuery } from "@gen/graphql-types";
import { parseDefinition } from "@lib/definitionUrl";
import { SqlQueryParams } from "@lib/params";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

export default function DefinitionView(props: Props) {
  const router = useRouter();
  const { setEditorString } = useSqlEditorContext();

  const ctx = useMemo(
    () => parseDefinition(router.query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.definitionName,
      router.query.definitionKind,
      router.query.definitionSchema,
    ],
  );

  const res = useSchemaDefinitionQuery({
    variables: {
      databaseName: props.params.databaseName,
      refName: props.params.refName,
      schemaName: ctx?.schemaName,
      name: ctx?.name ?? "",
      kind: ctx?.kind ?? ("Table" as never),
    },
    skip: !ctx,
  });
  const data = res.data?.schemaDefinition;

  useEffect(() => {
    if (data?.queryString) setEditorString(data.queryString);
  }, [data?.queryString, setEditorString]);

  if (!ctx) {
    return (
      <ErrorMsg
        errString="Cannot display definition. Click a definition item to enable this."
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
