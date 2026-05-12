import CommitDiffTable from "@components/CommitDiffTable";
import HistoryTable from "@components/HistoryTable";
import SchemaFragment from "@components/SchemaFragment";
import SqlDataTable from "@components/SqlDataTable";
import QueryBreadcrumbs from "@components/breadcrumbs/QueryBreadcrumbs";
import { DataTableProvider } from "@contexts/dataTable";
import useSqlParser from "@hooks/useSqlParser";
import { isShowSchemaFragmentQuery } from "@lib/doltSystemTables";
import { RefParams, SqlQueryParams } from "@lib/params";
import { ref, sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import DatabasePage from "./component";

type Props = {
  params: SqlQueryParams;
};

function Inner({ params }: Props) {
  const router = useRouter();
  const { isMutation } = useSqlParser();
  const routeRefChangeTo = (p: RefParams) =>
    isMutation(params.q)
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

  if (isShowSchemaFragmentQuery(params.q)) {
    return (
      <DatabasePage {...commonProps}>
        <SchemaFragment params={params} />
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
  const { isMutation } = useSqlParser();
  return (
    <DataTableProvider
      {...props}
      showingWorkingDiff={isMutation(props.params.q)}
    >
      <Inner {...props} />
    </DataTableProvider>
  );
}
