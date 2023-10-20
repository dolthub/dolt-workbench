import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import DatabasePage from "../../component";
import NewDocForm from "./NewDocForm";

type Props = {
  params: RefParams;
};

export default function NewDocPage({ params }: Props) {
  return (
    <DatabasePage
      params={params}
      routeRefChangeTo={newDoc}
      initialTabIndex={1}
      // smallHeaderBreadcrumbs={<NewDocBreadcrumbs params={params} />}
    >
      <NewDocForm params={params} />
    </DatabasePage>
  );
}
