import NotDoltWrapper from "@components/util/NotDoltWrapper";
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
      <NotDoltWrapper showNotDoltMsg feature="Creating docs" bigMsg>
        <NewDocForm params={params} />
      </NotDoltWrapper>
    </DatabasePage>
  );
}
