import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import DatabasePage from "../../component";

type Props = {
  params: OptionalRefParams;
  compare?: boolean;
};

export default function ForNotDolt(props: Props) {
  return (
    <DatabasePage
      params={props.params}
      initialTabIndex={2}
      wide
      routeRefChangeTo={commitLog}
    >
      <NotDoltWrapper
        connectionName={props.params.connectionName}
        showNotDoltMsg
        feature={`Viewing ${props.compare ? "diffs" : "commit logs"}`}
        bigMsg
      >
        <div />
      </NotDoltWrapper>
    </DatabasePage>
  );
}
