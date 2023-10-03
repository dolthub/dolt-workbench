import { DatabaseParams } from "@lib/params";
import CreateTableOptions from "../CreateTableOptions";
import DatabaseDesktopOnly from "../DatabaseDesktopOnly";
import ForDefaultBranch from "../ForDefaultBranch";

type Props = {
  params: DatabaseParams & {
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
    <DatabaseDesktopOnly params={params} title="create table">
      <ForDefaultBranch
        params={params}
        hideDefaultTable
        showSqlConsole
        leftNavInitiallyOpen
      >
        <CreateTableOptions params={params} />
      </ForDefaultBranch>
    </DatabaseDesktopOnly>
  );
}
