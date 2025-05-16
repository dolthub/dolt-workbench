import Page404 from "@components/Page404";
import { Button, Loader } from "@dolthub/react-components";
import { useAnchorTag, useReactiveWidth } from "@dolthub/react-hooks";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import Link from "@components/links/Link";
import { useCommitListForBranch } from "@hooks/useCommitListForBranch";
import { RefParams } from "@lib/params";
import { compare } from "@lib/urls";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import CommitGraphButton from "./CommitGraphButton";
import CommitHeader from "./CommitHeader";
import CommitLogItem from "./CommitLogItem";
import Uncommitted from "./Uncommitted";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = {
  commits?: CommitForHistoryFragment[];
  loadMore: () => void;
  hasMore: boolean;
} & Props;

function Inner({ commits, ...props }: InnerProps) {
  const router = useRouter();
  useAnchorTag();
  const { isMobile } = useReactiveWidth(1024);
  const [activeHash, setActiveHash] = useState(
    router.asPath.split("#")[1] || "",
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
    };

    window.addEventListener("hashchange", handleHashChange, false);

    return () => {
      window.removeEventListener("hashchange", handleHashChange, false);
    };
  }, []);

  return (
    <div>
      {commits ? (
        <div className={css.container}>
          <div className={css.top}>
            <h1 className={css.title}>Commit Log</h1>
            <Button.Group className={css.buttons}>
              <Link {...compare(props.params)}>
                <Button className={css.button}>Diff Commits</Button>
              </Link>
              <CommitGraphButton params={props.params} />
            </Button.Group>
          </div>
          <InfiniteScroll
            loadMore={props.loadMore}
            hasMore={props.hasMore}
            loader={
              <p className={css.loading} key={0}>
                Loading commits...
              </p>
            }
            useWindow={!!isMobile}
            initialLoad={false}
            getScrollParent={() => document.getElementById("main-content")}
            className={css.scrollContainer}
          >
            <Uncommitted params={props.params} />
            <ol className={css.list} data-cy="commit-log-commits-list">
              {commits.map((c, i) => {
                const lastCommit = commits[i - 1];
                return (
                  <>
                    <CommitHeader
                      key={`header-${c._id}`}
                      commit={c}
                      lastCommit={lastCommit}
                    />
                    <CommitLogItem
                      {...props}
                      key={c._id}
                      commit={c}
                      activeHash={activeHash}
                    />
                  </>
                );
              })}
            </ol>
          </InfiniteScroll>
        </div>
      ) : (
        <p className={css.noCommits}>No commits found</p>
      )}
    </div>
  );
}

export default function CommitLog(props: Props) {
  const { loading, commits, loadMore, hasMore, error } = useCommitListForBranch(
    props.params,
  );

  if (loading) return <Loader loaded={false} />;

  if (error) {
    const title = `Commits for ${props.params.databaseName}`;
    return <Page404 title={title} error={error} />;
  }

  return (
    <Inner {...props} commits={commits} loadMore={loadMore} hasMore={hasMore} />
  );
}
