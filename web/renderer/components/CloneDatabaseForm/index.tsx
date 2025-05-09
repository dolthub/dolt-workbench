import { ErrorMsg, QueryHandler } from "@dolthub/react-components";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import CloneDetails from "./CloneDetails";

type Props = {
  cloneDolt: boolean;
  setCloneDolt: (c: boolean) => void;
};

export default function CloneDatabaseForm(props: Props) {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={res}
      render={data =>
        data.currentConnection ? (
          <CloneDetails {...props} currentConnection={data.currentConnection} />
        ) : (
          <ErrorMsg errString="Could not find current connection." />
        )
      }
    />
  );
}
