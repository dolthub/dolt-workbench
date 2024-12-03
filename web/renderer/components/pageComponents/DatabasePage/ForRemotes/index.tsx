import RemotesBreadcrumbs from "@components/breadcrumbs/RemotesBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { DatabaseParams } from "@lib/params";
import { remotes } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import RemotesPage from "./RemotesPage";
import AddRemotePage from "./AddRemotePage";

type Props = {
  params: DatabaseParams;
  newRemote?: boolean;
};

export default function ForRemotes({ params, newRemote }: Props): JSX.Element {
  const feature = newRemote ? "Creating remotes" : "Viewing Remotes";
  console.log("ForRemotes", params, newRemote);
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
        {newRemote ? (
          <AddRemotePage params={params} />
        ) : (
          <RemotesPage params={params} />
        )}
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
