import RemotesBreadcrumbs from "@components/breadcrumbs/RemotesBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { remotes } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import RemotesPage from "./RemotesPage";

type Props = {
  params: OptionalRefParams;
  newRemote?: boolean;
};

export default function ForRemotes({ params, newRemote }: Props): JSX.Element {
  const feature = newRemote ? "Creating remotes" : "Viewing Remotes";
  return (
    <ForDefaultBranch
      initialTabIndex={5}
      params={params}
      hideDefaultTable
      smallHeaderBreadcrumbs={<RemotesBreadcrumbs params={params} />}
      title="remotes"
      routeRefChangeTo={remotes}
    >
      <NotDoltWrapper showNotDoltMsg feature={feature} bigMsg>
        <RemotesPage params={params} />
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}