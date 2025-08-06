import { ErrorMsg, QueryHandler } from "@dolthub/react-components";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import CloneDetails from "./CloneDetails";

export default function CloneDatabaseForm() {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={res}
      render={data =>
        data.currentConnection ? (
          <CloneDetails currentConnection={data.currentConnection} />
        ) : (
          <ErrorMsg errString="Could not find current connection." />
        )
      }
    />
  );
}
