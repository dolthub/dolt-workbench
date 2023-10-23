import CommitGraph from "@components/CommitGraph";
import CommitGraphBreadcrumbs from "@components/breadcrumbs/CommitGraphBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
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
        smallHeaderBreadcrumbs={<CommitGraphBreadcrumbs params={params} />}
      >
        <NotDoltWrapper showNotDoltMsg feature="Viewing commit graph" bigMsg>
          <CommitGraph params={params} />
        </NotDoltWrapper>
      </DatabasePage>
    </DatabaseDesktopOnly>
  );
}
