import PullConflictBreadcrumbs from "@components/breadcrumbs/PullConflictBreadcrumbs";
import DocsLink from "@components/links/DocsLink";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Loader } from "@dolthub/react-components";
import { errorMatches } from "@lib/errors/helpers";
import { PullDiffParams } from "@lib/params";
import { pulls } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import ConflictsTable from "./ConflictsTable";
import { ConflictsProvider, useConflictsContext } from "./contexts/conflicts";
import css from "./index.module.css";
import LeftNav from "./LeftNav";
import useRowConflicts from "./useRowConflicts";

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

type InnerProps = {
  params: PullDiffParams;
};

function Inner(props: InnerProps) {
  const { activeTableName } = useConflictsContext();
  const res = useRowConflicts({ ...props.params, tableName: activeTableName });
  if (res.loading) return <Loader loaded={!res.loading} />;
  if (res.error && errorMatches("schema conflicts found", res.error)) {
    return (
      <div className={css.container}>
        <h3>Schema conflicts found for {activeTableName}</h3>
        <p>
          Cannot view data conflict rows until schema conflicts have been
          resolved. View instructions{" "}
          <DocsLink path="/sql-reference/version-control/merges#schema">
            here
          </DocsLink>
          .
        </p>
      </div>
    );
  }
  return (
    <div className={css.container}>
      <h3>
        Conflicted rows in <code>{activeTableName}</code>
      </h3>
      <ConflictsTable
        state={res.state}
        fetchMore={res.fetchMore}
        hasMore={res.hasMore}
        error={res.error}
      />
    </div>
  );
}
