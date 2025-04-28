import { useConfigContext } from "@components/pageComponents/ConnectionsPage/NewConnection/context/config";
import { Checkbox, QueryHandler } from "@dolthub/react-components";
import { useCurrentConnectionQuery } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  cloneDolt: boolean;
  setCloneDolt: (c: boolean) => void;
};

export default function CloneDatabaseCheckbox({
  cloneDolt,
  setCloneDolt,
}: Props) {
  const res = useCurrentConnectionQuery();
  const { state, setState } = useConfigContext();

  return (
    <QueryHandler
      result={res}
      render={data => (
        <Checkbox
          checked={cloneDolt}
          onChange={e => {
            setState({
              useSSL: cloneDolt,
              port: e.target.checked ? "3658" : state.port,
              isLocalDolt: !cloneDolt,
              cloneDolt: !cloneDolt,
              name: data.currentConnection?.name,
            });
            setCloneDolt(!cloneDolt);
          }}
          name="clone-dolt-server"
          label="Clone a remote Dolt database"
          description="Clone a Dolt database from DoltHub"
          className={css.checkbox}
        />
      )}
    />
  );
}
