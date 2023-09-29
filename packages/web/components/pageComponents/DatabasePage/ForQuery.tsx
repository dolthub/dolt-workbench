import HistoryTable from "@components/HistoryTable";
import SqlDataTable from "@components/SqlDataTable";
import ViewFragment from "@components/ViewFragment";
import { DataTableProvider } from "@contexts/dataTable";
import {
  isDoltDiffTableQuery,
  isShowViewFragmentQuery,
} from "@lib/doltSystemTables";
import { SqlQueryParams } from "@lib/params";
import DatabasePage from "./component";

type Props = {
  params: SqlQueryParams;
};

function Inner({ params }: Props) {
  const commonProps = {
    initialTabIndex: 0,
    params,
  };

  if (isDoltDiffTableQuery(params.q)) {
    return (
      <DatabasePage {...commonProps}>
        <HistoryTable params={params} />
      </DatabasePage>
    );
  }

  if (isShowViewFragmentQuery(params.q)) {
    return (
      <DatabasePage {...commonProps}>
        <ViewFragment params={params} />
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
  return (
    <DataTableProvider {...props}>
      <Inner {...props} />
    </DataTableProvider>
  );
}
