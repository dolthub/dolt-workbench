import { QueryHandler } from "@dolthub/react-components";
import { RemoteFragment, useRemoteListQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import css from "./index.module.css";
import Row from "./Row";

type Props = {
  params: DatabaseParams;
};

type InnerProps = {
  remotes: RemoteFragment[];
};

function Inner({ remotes }: InnerProps) {
  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Remotes</h1>
      </div>

      {remotes.length ? (
        <div className={css.tableParent}>
          <table className={css.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Url</th>
                <th>Fetch Specs</th>
              </tr>
            </thead>
            <tbody>
              {remotes.map(r => (
                <Row key={r._id} remote={r} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={css.noRemotes} data-cy="remote-list-no-remotes">
          No remotes found
        </p>
      )}
    </div>
  );
}

export default function RemotesPage({ params }: Props) {
  const res = useRemoteListQuery({ variables: params });
  return (
    <QueryHandler
      result={{ ...res, data: res.data?.remotes.list }}
      render={data => <Inner remotes={data} />}
    />
  );
}
