import { QueryHandler } from "@dolthub/react-components";
import { RemoteFragment, useRemoteListQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";

type Props = {
  params: DatabaseParams;
};

type InnerProps = {
  remotes : RemoteFragment[];
};

function Inner({ remotes }: InnerProps) {
  return (
    <ul>
      {remotes.map(remote => (
        <li key={remote.name}>
          <span>{remote.name}</span>
          <span>{remote.url}</span>
          <span>{remote.fetchSpecs}</span>
        </li>
      ))}
    </ul>
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
