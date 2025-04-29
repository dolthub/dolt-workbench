import { ConfigProvider } from "@components/pageComponents/ConnectionsPage/NewConnection/context/config";
import { QueryHandler } from "@dolthub/react-components";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import CloneDetails from "./CloneDetails";

type Props = {
  cloneDolt: boolean;
  setCloneDolt: (c: boolean) => void;
  forInit?: boolean;
};

export default function CloneDatabaseForm(props: Props) {
  const res = useCurrentConnectionQuery();

  return (
    <QueryHandler
      result={res}
      render={data => (
        <ConfigProvider>
          <CloneDetails {...props} name={data.currentConnection?.name} />
        </ConfigProvider>
      )}
    />
  );
}
