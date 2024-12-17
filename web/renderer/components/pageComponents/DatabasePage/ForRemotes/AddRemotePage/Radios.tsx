import { Radio } from "@dolthub/react-components";
import css from "./index.module.css";

export enum RemoteType {
  DoltHub,
  Other,
}

type Props = {
  type: RemoteType;
  setType: (t: RemoteType) => void;
};

export default function Radios(props: Props) {
  return (
    <div className={css.radios}>
      <Radio
        name="DoltHub"
        checked={props.type === RemoteType.DoltHub}
        onChange={() => props.setType(RemoteType.DoltHub)}
        label="DoltHub"
      />
      <Radio
        name="Other"
        checked={props.type === RemoteType.Other}
        onChange={() => props.setType(RemoteType.Other)}
        label="Other"
      />
    </div>
  );
}
