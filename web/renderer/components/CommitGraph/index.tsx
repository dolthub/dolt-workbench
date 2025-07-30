import { Database404Inner } from "@components/Database404";
import Page404 from "@components/Page404";
import { Loader } from "@dolthub/react-components";
import { useCommitListForCommitGraph } from "@hooks/useCommitListForCommitGraph";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { RefParams } from "@lib/params";
import useDiffForTableListLazy from "@hooks/useCommitListForCommitGraph/useDiffForTableListLazy";
import CommitLogButton from "./CommitLogButton";
import Inner from "./Inner";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function CommitGraph(props: Props) {
  const { loading, commits, loadMore, hasMore, error, branchHeads } =
    useCommitListForCommitGraph(props.params);
  const { getDiff } = useDiffForTableListLazy(props.params);

  if (loading) return <Loader loaded={false} />;

  if (error || !commits) {
    if (errorMatches(gqlDepNotFound, error)) {
      return <Database404Inner {...props} />;
    }
    const title = `Commits for ${props.params.databaseName} not found`;
    return <Page404 title={title} error={error} />;
  }

  return (
    <div className={css.container} data-cy="commit-graph">
      <div className={css.top}>
        <h1 className={css.title}>Commit Graph</h1>
        <CommitLogButton {...props} />
      </div>
      <Inner
        {...props}
        commits={commits}
        loadMore={loadMore}
        hasMore={hasMore}
        branchHeads={branchHeads}
        getDiff={getDiff}
      />
    </div>
  );
}
