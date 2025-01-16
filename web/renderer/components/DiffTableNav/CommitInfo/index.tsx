import { QueryHandler } from "@dolthub/react-components";
import { useHistoryForCommitQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { useRouter } from "next/router";
import Inner, { shortCommit } from "./Inner";
import css from "./index.module.css";

type Props = {
  params: RefParams & { toCommitId: string; fromCommitId?: string };
};

function Query({ params }: Props) {
  const res = useHistoryForCommitQuery({
    variables: {
      databaseName: params.databaseName,
      afterCommitId: params.toCommitId,
    },
  });

  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner params={params} toCommitInfo={data.commits.list[0]} />
      )}
    />
  );
}

export default function CommitInfo({ params }: Props) {
  const router = useRouter();
  // Only use fromCommitId in Commit if it is present in the route
  const fromCommitForInfo = isDiffRange(router.asPath)
    ? params.fromCommitId
    : undefined;

  if (fromCommitForInfo) {
    return (
      <div className={css.container} data-cy="commit-info">
        <div className={css.top}>
          <div data-cy="viewing-message">
            Viewing changes from{" "}
            <span className={css.hash}>
              {getDiffRange(fromCommitForInfo, params.toCommitId)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return <Query params={params} />;
}

export function getDiffRange(fromCommit: string, toCommit: string): string {
  return `${fromCommit.includes("/") ? fromCommit : shortCommit(fromCommit)}..${toCommit.includes("/") ? toCommit : shortCommit(toCommit)}`;
}

function isDiffRange(asPath: string) {
  return asPath.includes("..");
}
