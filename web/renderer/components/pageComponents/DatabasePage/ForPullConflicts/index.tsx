import PullConflictBreadcrumbs from "@components/breadcrumbs/PullConflictBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { QueryHandler } from "@dolthub/react-components";
import { usePullRowConflictsQuery } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import { pulls } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import ConflictsTable from "./ConflictsTable";
import { ConflictsProvider, useConflictsContext } from "./contexts/conflicts";
import css from "./index.module.css";
import LeftNav from "./LeftNav";

type Props = {
  params: PullDiffParams;
  tableName?: string;
};

export default function ForPullConflicts(props: Props) {
  return (
    <ConflictsProvider {...props}>
      <ForDefaultBranch
        initialTabIndex={4}
        params={props.params}
        routeRefChangeTo={pulls}
        title="pulls"
        smallHeaderBreadcrumbs={
          <PullConflictBreadcrumbs params={props.params} />
        }
        initialSmallHeader
        leftTableNav={<LeftNav params={props.params} />}
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
  const { activeTableName } = useConflictsContext();
  const res = usePullRowConflictsQuery({
    variables: {
      ...props.params,
      toBranchName: props.params.refName,
      tableName: activeTableName,
    },
  });
  return (
    <div className={css.container}>
      <h3>
        Conflicted rows in <code>{activeTableName}</code>
      </h3>
      <QueryHandler
        result={res}
        render={data => (
          <ConflictsTable
            tableName={activeTableName}
            columns={data.pullRowConflicts.columns}
            rows={data.pullRowConflicts.list}
          />
        )}
      />
    </div>
  );
}
