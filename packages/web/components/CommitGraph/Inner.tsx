import { CommitForHistoryFragment } from "@gen/graphql-types";
import { BranchHeads } from "@hooks/useCommitListForCommitGraph";
import { RefParams } from "@lib/params";
import { CommitGraph as Graph } from "commit-graph";
import InfiniteScroll from "react-infinite-scroller";
import css from "./index.module.css";
import { branchPathColors, getCommits } from "./utils";

type Props = {
  params: RefParams;
  commits: CommitForHistoryFragment[];
  loadMore: () => Promise<void>;
  branchHeads: BranchHeads[];
  hasMore: boolean;
};

export default function Inner(props: Props) {
  return (
    <div className={css.graphContainer}>
      <InfiniteScroll
        loadMore={async () => props.loadMore()}
        hasMore={props.hasMore}
        useWindow={false}
        initialLoad={false}
        loader={
          <div className={css.loader} key={0}>
            Loading graph...
          </div>
        }
        getScrollParent={() => document.getElementById("main-content")}
      >
        <Graph
          commits={getCommits(props.commits, props.params)}
          branchHeads={props.branchHeads}
          graphStyle={{
            commitSpacing: 72,
            branchSpacing: 20,
            nodeRadius: 2,
            branchColors: branchPathColors,
          }}
        />
      </InfiniteScroll>
    </div>
  );
}
