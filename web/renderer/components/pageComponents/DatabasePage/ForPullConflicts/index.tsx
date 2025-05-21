import PullDiffBreadcrumbs from "@components/breadcrumbs/PullDiffBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { QueryHandler } from "@dolthub/react-components";
import {
  usePullConflictsSummaryQuery,
  usePullRowConflictsQuery,
} from "@gen/graphql-types";
import { PullDiffParams, PullDiffParamsWithTableName } from "@lib/params";
import { pulls } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import ConflictsTable from "./ConflictsTable";
import { ConflictsProvider } from "./contexts/conflicts";

type Props = {
  params: PullDiffParams;
  tableName?: string;
};

export default function ForPullConflicts(props: Props) {
  return (
    <ConflictsProvider tableName={props.tableName}>
      <ForDefaultBranch
        initialTabIndex={4}
        params={props.params}
        routeRefChangeTo={pulls}
        title="pulls"
        smallHeaderBreadcrumbs={<PullDiffBreadcrumbs params={props.params} />}
        initialSmallHeader
        // leftTableNav={<DiffTableNav.ForPull {...props} />}
        wide
        hideDefaultTable
      >
        <NotDoltWrapper showNotDoltMsg feature="Viewing pull conflicts" bigMsg>
          <Inner {...props} />
        </NotDoltWrapper>
      </ForDefaultBranch>
    </ConflictsProvider>
  );
}

function Inner(props: Props) {
  const res = usePullConflictsSummaryQuery({
    variables: { ...props.params, toBranchName: props.params.refName },
  });
  return (
    <QueryHandler
      result={res}
      render={data => (
        <div>
          {data.pullConflictsSummary?.map(pcs => (
            <InnerTable
              params={{ ...props.params, tableName: pcs.tableName }}
            />
          ))}
        </div>
      )}
    />
  );
}

type InnerTableProps = {
  params: PullDiffParamsWithTableName;
};

function InnerTable(props: InnerTableProps) {
  const res = usePullRowConflictsQuery({
    variables: { ...props.params, toBranchName: props.params.refName },
  });
  return (
    <QueryHandler
      result={res}
      render={data => (
        <ConflictsTable
          columns={data.pullRowConflicts.columns}
          rows={data.pullRowConflicts.list}
        />
      )}
    />
  );
}
