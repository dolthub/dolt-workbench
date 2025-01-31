import CommitDiffBreadcrumbs from "@components/breadcrumbs/CommitDiffBreadcrumbs";
import { QueryHandler } from "@dolthub/react-components";
import { useHistoryForCommitQuery } from "@gen/graphql-types";
import splitDiffRange from "@lib/diffRange";
import { DiffRangeParams, RefParams } from "@lib/params";
import ForError from "../../ForError";
import DiffPage from "./component";

type Props = {
  params: DiffRangeParams;
  tableName?: string;
};

type InnerProps = {
  params: RefParams & { fromCommitId: string };
  tableName?: string;
};

function Inner(props: InnerProps) {
  const { databaseName } = props.params;
  const res = useHistoryForCommitQuery({
    variables: {
      databaseName,
      connectionName: props.params.connectionName,
      afterCommitId: props.params.fromCommitId,
    },
  });

  return (
    <QueryHandler
      result={res}
      errComponent={<ForError params={props.params} />}
      render={data => (
        <DiffPage
          tableName={props.tableName}
          params={props.params}
          initialToCommitId={props.params.fromCommitId}
          initialFromCommitId={
            data.commits.list[0].parents.length
              ? data.commits.list[0].parents[0]
              : props.params.fromCommitId
          }
          smallHeaderBreadcrumbs={
            <CommitDiffBreadcrumbs params={props.params} />
          }
        />
      )}
    />
  );
}

export default function ForDiffRange(props: Props) {
  const { fromCommitId, toCommitId } = splitDiffRange(props.params.diffRange);

  if (toCommitId) {
    return (
      <DiffPage
        tableName={props.tableName}
        params={props.params}
        initialFromCommitId={fromCommitId}
        initialToCommitId={toCommitId}
        smallHeaderBreadcrumbs={<CommitDiffBreadcrumbs params={props.params} />}
      />
    );
  }

  return <Inner {...props} params={{ ...props.params, fromCommitId }} />;
}
