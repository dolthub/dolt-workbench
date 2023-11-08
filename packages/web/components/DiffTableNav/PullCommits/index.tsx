import QueryHandler from "@components/util/QueryHandler";
import {
  CommitForHistoryFragment,
  usePullCommitsQuery,
} from "@gen/graphql-types";
import excerpt from "@lib/excerpt";
import { DiffParamsWithRefs } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: DiffParamsWithRefs & { refName?: string };
};

type InnerProps = Props & {
  commits: CommitForHistoryFragment[];
};

function Inner(props: InnerProps) {
  return (
    <div>
      {props.commits.length ? (
        <ul>
          {props.commits.map(c => (
            <li key={c._id}>
              <span className={css.hash}>{c.commitId}</span>
              <span className={css.message}>{excerpt(c.message, 100)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          <code>{props.params.toRefName}</code> is up to date with commits from{" "}
          <code>{props.params.fromRefName}</code>
        </p>
      )}
    </div>
  );
}

export default function PullCommits(props: Props) {
  const res = usePullCommitsQuery({
    variables: {
      ...props.params,
      refName: props.params.fromRefName,
      excludingCommitsFromRefName: props.params.toRefName,
    },
  });

  return (
    <div className={css.container}>
      <h4>Commits</h4>
      <QueryHandler
        result={res}
        render={data => <Inner {...props} commits={data.commits.list} />}
      />
    </div>
  );
}
