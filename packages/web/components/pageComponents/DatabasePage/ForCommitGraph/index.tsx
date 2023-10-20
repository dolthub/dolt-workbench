import CommitGraph from "@components/CommitGraph";
import { RefParams } from "@lib/params";
import { commitGraph } from "@lib/urls";
import DatabaseDesktopOnly from "../DatabaseDesktopOnly";
import DatabasePage from "../component";

type Props = {
  params: RefParams;
};

export default function ForCommitGraph({ params }: Props) {
  return (
    <DatabaseDesktopOnly
      title="Commit graph"
      params={params}
      routeRefChangeTo={commitGraph}
    >
      <DatabasePage
        params={params}
        routeRefChangeTo={commitGraph}
        initialTabIndex={2}
        // smallHeaderBreadcrumbs={<CommitGraphBreadcrumbs params={params} />}
      >
        <CommitGraph params={params} />
      </DatabasePage>
    </DatabaseDesktopOnly>
  );
}
