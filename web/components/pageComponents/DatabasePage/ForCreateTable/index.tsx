import { DatabaseOptionalSchemaParams } from "@lib/params";
import { createTable } from "@lib/urls";
import CreateTableOptions from "../CreateTableOptions";
import DatabaseDesktopOnly from "../DatabaseDesktopOnly";
import ForDefaultBranch from "../ForDefaultBranch";

type Props = {
  params: DatabaseOptionalSchemaParams & {
    refName?: string | null;
    active?: string;
    edit?: boolean;
  };
};

export default function CreateTableButtons(props: Props) {
  const params = {
    ...props.params,
    refName: props.params.refName ?? undefined,
  };
  return (
    <DatabaseDesktopOnly
      params={params}
      title="create table"
      routeRefChangeTo={createTable}
    >
      <ForDefaultBranch
        params={params}
        routeRefChangeTo={createTable}
        hideDefaultTable
        showSqlConsole
        leftNavInitiallyOpen
      >
        <CreateTableOptions params={params} />
      </ForDefaultBranch>
    </DatabaseDesktopOnly>
  );
}
