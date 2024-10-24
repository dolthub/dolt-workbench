import { OptionalRefParams } from "@lib/params";
import { ref } from "@lib/urls";
import DatabasePage from "../component";
import EmptyDB from "./EmptyDB";

type Props = {
  params: OptionalRefParams;
  title?: string;
};

export default function ForEmpty(props: Props) {
  return (
    <DatabasePage {...props} initialTabIndex={0} empty routeRefChangeTo={ref}>
      <EmptyDB {...props} />
    </DatabasePage>
  );
}
