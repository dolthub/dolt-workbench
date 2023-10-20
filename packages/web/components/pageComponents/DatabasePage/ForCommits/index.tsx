import { RefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import DatabasePage from "../component";
import CommitLog from "./CommitLog";

type Props = {
  params: RefParams & { diffRange?: string };
  initialFromCommitId?: string;
  initialToCommitId?: string;
  compare?: boolean;
  tableName?: string;
};

export default function ForCommits(props: Props) {
  const notCommitLogPage =
    !props.params.refName || props.compare || !!props.params.diffRange;
  const commonProps = {
    params: props.params,
    initialTabIndex: 2,
    wide: notCommitLogPage,
  };

  // if (props.compare) {
  //   return <DiffPage.ForBranch {...props} params={refParams} />;
  // }

  // if (props.params.diffRange) {
  //   return (
  //     <DiffPage.ForDiffRange
  //       {...props}
  //       params={{ ...refParams, diffRange: props.params.diffRange }}
  //     />
  //   );
  // }

  return (
    <DatabasePage
      {...commonProps}
      // smallHeaderBreadcrumbs={<CommitsBreadcrumbs params={refParams} />}
      title="commitLog"
      routeRefChangeTo={commitLog}
    >
      <CommitLog params={props.params} />
    </DatabasePage>
  );
}
