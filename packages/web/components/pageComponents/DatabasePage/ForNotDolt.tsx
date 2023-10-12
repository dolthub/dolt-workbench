import NotDoltMsg from "@components/util/NotDoltWrapper/NotDoltMsg";
import { OptionalRefParams } from "@lib/params";
import { database } from "@lib/urls";
import DatabasePage from "./component";

type Props = {
  params: OptionalRefParams;
  feature: string;
  title?: string;
};

export default function ForNotDolt(props: Props) {
  return (
    <DatabasePage
      params={{ ...props.params, refName: "main" }}
      title={props.title}
      initialTabIndex={0}
      leftNavInitiallyOpen
      routeRefChangeTo={database}
    >
      <NotDoltMsg feature={props.feature} big />
    </DatabasePage>
  );
}
