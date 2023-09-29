import DataTable from "@components/DataTable";
import { DataTableProvider } from "@contexts/dataTable";
import { TableParams } from "@lib/params";
import DatabasePage from "../component";
import EditTableButtons from "./EditTableButtons";

type Props = {
  params: TableParams;
  edit?: boolean;
};

export default function ForTable(props: Props) {
  return (
    <DataTableProvider params={props.params}>
      <DatabasePage initialTabIndex={0} params={props.params} title="ref">
        {props.edit ? (
          <EditTableButtons params={props.params} />
        ) : (
          <DataTable params={props.params} />
        )}
      </DatabasePage>
    </DataTableProvider>
  );
}
