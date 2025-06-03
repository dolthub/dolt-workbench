import { CommitForHistoryFragment } from "@gen/graphql-types";
import { BranchHeads } from "@hooks/useCommitListForCommitGraph";
import { RefParams } from "@lib/params";
import { CommitGraph as Graph, Diff } from "commit-graph";
import css from "./index.module.css";
import { branchPathColors, getCommits } from "./useCommit";

type Props = {
  params: RefParams;
  commits: CommitForHistoryFragment[];
  loadMore: () => Promise<void>;
  branchHeads: BranchHeads[];
  hasMore: boolean;
  getDiff: (base: string, head: string) => Promise<Diff | undefined>;
};

export default function Inner(props: Props) {
  return (
    <div className={css.graphContainer}>
      <Graph.WithInfiniteScroll
        commits={getCommits(props.commits, props.params)}
        branchHeads={props.branchHeads}
        currentBranch={props.params.refName}
        graphStyle={{
          commitSpacing: 72,
          branchSpacing: 20,
          nodeRadius: 2,
          branchColors: branchPathColors,
        }}
        loadMore={async () => props.loadMore()}
        hasMore={props.hasMore}
        parentID="main-content"
        getDiff={props.getDiff}
        forDolt
      />
    </div>
  );
}
