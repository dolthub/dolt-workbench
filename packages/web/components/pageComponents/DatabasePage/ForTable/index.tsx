import DataTable from "@components/DataTable";
import { DataTableProvider } from "@contexts/dataTable";
import { TableParams } from "@lib/params";
import DatabasePage from "../component";

type Props = {
  params: TableParams;
  edit?: boolean;
};

export default function ForTable(props: Props) {
  return (
    <DataTableProvider params={props.params}>
      <DatabasePage initialTabIndex={0} params={props.params} title="ref">
        <DataTable params={props.params} />
      </DatabasePage>
    </DataTableProvider>
  );
}
