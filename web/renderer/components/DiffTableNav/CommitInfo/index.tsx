import { QueryHandler } from "@dolthub/react-components";
import { useHistoryForCommitQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { useRouter } from "next/router";
import Inner from "./Inner";
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
            Viewing changes
            <div className={css.hashes}>
              <div>
                <span className={css.fixedWidth}>from</span>
                <span className={css.bold}>{fromCommitForInfo}</span>
              </div>
              <div>
                <span className={css.fixedWidth}>to</span>{" "}
                <span className={css.bold}>{params.toCommitId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <Query params={params} />;
}

export function getDiffRange(fromCommit: string, toCommit: string): string {
  return `${fromCommit}..${toCommit}`;
}

function isDiffRange(asPath: string) {
  return asPath.includes("..");
}
