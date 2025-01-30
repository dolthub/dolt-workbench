import CommitsBreadcrumbs from "@components/breadcrumbs/CommitsBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { OptionalRefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import DatabasePage from "../component";
import CommitLog from "./CommitLog";
import DiffPage from "./DiffPage";

type Props = {
  params: OptionalRefParams & { diffRange?: string };
  compare?: boolean;
  tableName?: string;
};

export default function ForCommits(props: Props) {
  const { isDolt } = useDatabaseDetails(props.params.connectionName);
  const notCommitLogPage =
    !props.params.refName || props.compare || !!props.params.diffRange;
  const commonProps = {
    params: props.params,
    initialTabIndex: 2,
    wide: notCommitLogPage,
  };

  if (!isDolt) {
    return <DiffPage.ForNotDolt {...props} />;
  }

  if (!props.params.refName) {
    return <DiffPage.ForDefaultBranch {...props} />;
  }

  const refParams = { ...props.params, refName: props.params.refName };
  if (props.compare) {
    return <DiffPage.ForBranch {...props} params={refParams} />;
  }

  if (props.params.diffRange) {
    return (
      <DiffPage.ForDiffRange
        {...props}
        params={{ ...refParams, diffRange: props.params.diffRange }}
      />
    );
  }

  return (
    <DatabasePage
      {...commonProps}
      smallHeaderBreadcrumbs={<CommitsBreadcrumbs params={refParams} />}
      title="commitLog"
      routeRefChangeTo={commitLog}
    >
      <NotDoltWrapper showNotDoltMsg feature="Viewing commit log" bigMsg>
        <CommitLog params={refParams} />
      </NotDoltWrapper>
    </DatabasePage>
  );
}
