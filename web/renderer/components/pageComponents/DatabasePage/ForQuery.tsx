import CommitDiffTable from "@components/CommitDiffTable";
import DefinitionView from "@components/DefinitionView";
import HistoryTable from "@components/HistoryTable";
import SchemaFragment from "@components/SchemaFragment";
import SqlDataTable from "@components/SqlDataTable";
import QueryBreadcrumbs from "@components/breadcrumbs/QueryBreadcrumbs";
import { DataTableProvider, useDataTableContext } from "@contexts/dataTable";
import { Loader } from "@dolthub/react-components";
import { SchemaType } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { parseDefinition } from "@lib/definitionUrl";
import { RefParams, SqlQueryParams } from "@lib/params";
import { ref, sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import DatabasePage from "./component";

type Props = {
  params: SqlQueryParams;
};

function Inner({ params }: Props) {
  const router = useRouter();
  const { isMutation } = useDataTableContext();
  const { isPostgres } = useDatabaseDetails();
  const routeRefChangeTo = (p: RefParams) =>
    isMutation
      ? ref(p)
      : sqlQuery({ ...p, q: params.q, active: params.active });

  const commonProps = {
    smallHeaderBreadcrumbs: <QueryBreadcrumbs params={params} />,
    initialTabIndex: 0,
    params,
    routeRefChangeTo,
  };

  if (router.query.historyTable) {
    return (
      <DatabasePage {...commonProps}>
        <HistoryTable params={params} />
      </DatabasePage>
    );
  }

  if (router.query.commitDiffTable) {
    return (
      <DatabasePage {...commonProps}>
        <CommitDiffTable params={params} />
      </DatabasePage>
    );
  }

  const def = parseDefinition(router.query);
  if (def) {
    const tabular =
      isPostgres &&
      (def.kind === SchemaType.Table || def.kind === SchemaType.Event);
    return (
      <DatabasePage {...commonProps}>
        {tabular ? (
          <DefinitionView params={params} />
        ) : (
          <SchemaFragment params={params} />
        )}
      </DatabasePage>
    );
  }

  return (
    <DatabasePage {...commonProps}>
      <SqlDataTable params={params} />
    </DatabasePage>
  );
}

export default function ForQuery(props: Props) {
  const { isSqlite, loading } = useDatabaseDetails();
  if (!props.params.q && loading) return <Loader loaded={false} />;
  const params = {
    ...props.params,
    q: props.params.q || defaultQuery(isSqlite),
  };
  return (
    <DataTableProvider params={params}>
      <Inner params={params} />
    </DataTableProvider>
  );
}

export function defaultQuery(isSqlite: boolean): string {
  if (!isSqlite) return "SHOW TABLES";
  return `SELECT name
FROM sqlite_master
WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
ORDER BY name;`;
}
