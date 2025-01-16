import DiffTableNav from "@components/DiffTableNav";
import DiffSelector from "@components/DiffSelector";
import CommitDiffBreadcrumbs from "@components/breadcrumbs/CommitDiffBreadcrumbs";
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
      leftTableNav={<DiffTableNav.ForRef params={props.params} />}
      wide
      routeRefChangeTo={commitLog}
      smallHeaderBreadcrumbs={<CommitDiffBreadcrumbs params={props.params} />}
    >
      <DiffSelector.ForBranchCommitAndTag params={props.params} />
    </DatabasePage>
  );
}
