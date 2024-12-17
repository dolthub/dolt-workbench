import { FormInput } from "@dolthub/react-components";
import { RemoteType } from "./Radios";
import css from "./index.module.css";
import { useState } from "react";

type Props = {
  type: RemoteType;
  remoteUrl: string;
  setRemoteUrl: (t: string) => void;
  currentDbName: string;
};

export default function RemoteUrl({
  type,
  remoteUrl,
  setRemoteUrl,
  currentDbName,
}: Props) {
  const [ownerName, setOwnerName] = useState("");
  const [dbName, setDbName] = useState(currentDbName);
  if (type === RemoteType.Other) {
    return (
      <FormInput
        value={remoteUrl}
        onChangeString={setRemoteUrl}
        label="Add remote url"
        placeholder="i.e. https://url-of-remote.com"
        className={css.input}
      />
    );
  }
  return (
    <div>
      <FormInput
        value={ownerName}
        onChangeString={(s: string) => {
          setOwnerName(s);
          setRemoteUrl(`https://doltremoteapi.dolthub.com/${s}/${dbName}`);
        }}
        label="Owner Name"
        placeholder="i.e. dolthub"
        className={css.input}
      />
      <FormInput
        value={dbName}
        onChangeString={(s: string) => {
          setDbName(s);
          setRemoteUrl(`https://doltremoteapi.dolthub.com/${ownerName}/${s}`);
        }}
        label="Database Name"
        placeholder="i.e. example-db"
        className={css.input}
      />
    </div>
  );
}
