import { useConfigContext } from "@components/pageComponents/ConnectionsPage/NewConnection/context/config";
import { Checkbox } from "@dolthub/react-components";
import css from "./index.module.css";
import CloneForm from "./CloneForm";

type Props = {
  cloneDolt: boolean;
  setCloneDolt: (c: boolean) => void;
  forInit?: boolean;
  name?: string;
};

export default function CloneDetails({
  cloneDolt,
  setCloneDolt,
  name,
  forInit,
}: Props) {
  const { state, setState } = useConfigContext();

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
            name,
          });
          setCloneDolt(!cloneDolt);
        }}
        name="clone-dolt-server"
        label="Clone a remote Dolt database"
        description="Clone a Dolt database from DoltHub"
        className={css.checkbox}
      />
      {cloneDolt && <CloneForm forInit={forInit} />}
    </div>
  );
}
