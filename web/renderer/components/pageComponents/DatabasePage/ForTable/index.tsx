import DataTable from "@components/DataTable";
import TableBreadcrumbs from "@components/breadcrumbs/TableBreadcrumbs";
import { DataTableProvider } from "@contexts/dataTable";
import { TableOptionalSchemaParams } from "@lib/params";
import { editTable, table } from "@lib/urls";
import DatabasePage from "../component";
import EditTableButtons from "./EditTableButtons";

type Props = {
  params: TableOptionalSchemaParams;
  edit?: boolean;
};

export default function ForTable(props: Props) {
  if (!props.params.tableName) {
    return null;
  }
  const { schemaName, tableName } = getSchemaAndTableName(props.params);
  const params = { ...props.params, schemaName, tableName };
  return (
    <DataTableProvider params={params}>
      <DatabasePage
        initialTabIndex={0}
        params={params}
        title="ref"
        smallHeaderBreadcrumbs={<TableBreadcrumbs params={params} />}
        routeRefChangeTo={p =>
          props.edit
            ? editTable({ ...p, tableName })
            : table({ ...p, tableName })
        }
      >
        {props.edit ? (
          <EditTableButtons params={params} />
        ) : (
          <DataTable params={params} />
        )}
      </DatabasePage>
    </DataTableProvider>
  );
}

function getSchemaAndTableName(params: TableOptionalSchemaParams): {
  schemaName?: string;
  tableName: string;
} {
  const { schemaName, tableName } = params;
  if (schemaName) {
    return params;
  }
  const parts = tableName.split(".");
  if (parts.length === 1) {
    return { tableName: parts[0] };
  }
  return { schemaName: parts[0], tableName: parts[1] };
}
