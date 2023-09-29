import DatabasePage from "../component";
import EmptyDB from "./EmptyDB";

type Props = {
  params: { refName?: string };
  title?: string;
};

export default function ForEmpty(props: Props) {
  return (
    <DatabasePage {...props} initialTabIndex={0} empty>
      <EmptyDB {...props} />
    </DatabasePage>
  );
}
