import DataTable from "@components/DataTable";
import TableBreadcrumbs from "@components/breadcrumbs/TableBreadcrumbs";
import { DataTableProvider } from "@contexts/dataTable";
import { TableParams } from "@lib/params";
import { editTable, table } from "@lib/urls";
import DatabasePage from "../component";
import EditTableButtons from "./EditTableButtons";

type Props = {
  params: TableParams;
  edit?: boolean;
};

export default function ForTable(props: Props) {
  return (
    <DataTableProvider params={props.params}>
      <DatabasePage
        initialTabIndex={0}
        params={props.params}
        title="ref"
        smallHeaderBreadcrumbs={<TableBreadcrumbs params={props.params} />}
        routeRefChangeTo={p =>
          props.edit
            ? editTable({ ...p, tableName: props.params.tableName })
            : table({ ...p, tableName: props.params.tableName })
        }
      >
        {props.edit ? (
          <EditTableButtons params={props.params} />
        ) : (
          <DataTable params={props.params} />
        )}
      </DatabasePage>
    </DataTableProvider>
  );
}
