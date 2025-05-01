import { Checkbox } from "@dolthub/react-components";
import { DatabaseConnectionFragment, DatabaseType } from "@gen/graphql-types";
import { ConfigState } from "@components/pageComponents/ConnectionsPage/NewConnection/context/state";
import css from "./index.module.css";
import CloneForm from "./CloneForm";
import { useClone } from "./useClone";

type Props = {
  cloneDolt: boolean;
  setCloneDolt: (c: boolean) => void;
  currentConnection: DatabaseConnectionFragment;
};

export default function CloneDetails({
  cloneDolt,
  setCloneDolt,
  currentConnection,
}: Props) {
  const { state, setState } = useClone(getConnectionState(currentConnection));

  return (
    <div className={css.form}>
      <Checkbox
        checked={cloneDolt}
        onChange={e => {
          setState({
            useSSL: cloneDolt,
            port: e.target.checked ? "3658" : state.port,
            isLocalDolt: !cloneDolt,
            cloneDolt: !cloneDolt,
          });
          setCloneDolt(!cloneDolt);
        }}
        name="clone-dolt-server"
        label="Clone a remote Dolt database"
        description="Clone a Dolt database from DoltHub"
        className={css.checkbox}
      />
      {cloneDolt && <CloneForm connectionState={state} />}
    </div>
  );
}

function getConnectionState(
  currentConnection: DatabaseConnectionFragment,
): ConfigState {
  return {
    name: currentConnection.name,
    owner: "",
    host: "",
    hostPlaceholder: "127.0.0.1",
    port: currentConnection.port || "3658",
    username: "root",
    password: "",
    database: "",
    connectionUrl: currentConnection.connectionUrl,
    hideDoltFeatures: currentConnection.hideDoltFeatures || false,
    useSSL: currentConnection.useSSL || true,
    showAbout: true,
    showConnectionDetails: false,
    showAdvancedSettings: false,
    loading: false,
    type: currentConnection.type || DatabaseType.Mysql,
    isLocalDolt: currentConnection.isLocalDolt || false,
    cloneDolt: true,
    progress: 0,
  };
}
