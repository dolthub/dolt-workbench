import { Radio } from "@dolthub/react-components";
import css from "./index.module.css";

export enum RemoteType {
  DoltHub,
  DoltLab,
  Other,
}

type Props = {
  type: RemoteType;
  setType: (t: RemoteType) => void;
};

export default function Radios(props: Props) {
  return (
    <div className={css.radios} data-cy="remote-type-radios">
      <Radio
        name="DoltHub"
        checked={props.type === RemoteType.DoltHub}
        onChange={() => props.setType(RemoteType.DoltHub)}
        label="DoltHub"
        data-cy="remote-type-dolthub"
      />
      <Radio
        name="DoltLab"
        checked={props.type === RemoteType.DoltLab}
        onChange={() => props.setType(RemoteType.DoltLab)}
        label="DoltLab"
        data-cy="remote-type-doltlab"
      />
      <Radio
        name="Other"
        checked={props.type === RemoteType.Other}
        onChange={() => props.setType(RemoteType.Other)}
        label="Other"
        data-cy="remote-type-other"
      />
    </div>
  );
}
