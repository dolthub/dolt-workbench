import DiffTableNav from "@components/DiffTableNav";
import CommitDiffBreadcrumbs from "@components/breadcrumbs/CommitDiffBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { RefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import DatabasePage from "../../component";

type Props = {
  params: RefParams;
};

export default function ForBranch(props: Props) {
  return (
    <DatabasePage
      params={props.params}
      initialTabIndex={2}
      leftTableNav={
        <NotDoltWrapper hideNotDolt>
          <DiffTableNav.ForRef params={props.params} />
        </NotDoltWrapper>
      }
      initialSmallHeader
      wide
      routeRefChangeTo={commitLog}
      smallHeaderBreadcrumbs={<CommitDiffBreadcrumbs params={props.params} />}
    >
      <div />
    </DatabasePage>
  );
}
