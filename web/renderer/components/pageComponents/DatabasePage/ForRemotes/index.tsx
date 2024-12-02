import RemotesBreadcrumbs from "@components/breadcrumbs/RemotesBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { branches } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import RemotesPage from "./RemotesPage";

type Props = {
  params: OptionalRefParams;
  newBranch?: boolean;
};

export default function ForBranches({ params, newBranch }: Props): JSX.Element {
  const feature = newBranch ? "Creating new branches" : "Viewing branches";
  return (
    <ForDefaultBranch
      initialTabIndex={5}
      params={params}
      hideDefaultTable
      smallHeaderBreadcrumbs={
        <RemotesBreadcrumbs params={params} />
      }
      routeRefChangeTo={urlParams => branches(urlParams)}
    >
      <NotDoltWrapper showNotDoltMsg feature={feature} bigMsg>
        <RemotesPage params={params}/>
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
