import { FormInput } from "@dolthub/react-components";
import { useState } from "react";
import { RemoteType } from "./Radios";
import css from "./index.module.css";

type Props = {
  type: RemoteType;
  remoteUrl: string;
  setRemoteUrl: (t: string) => void;
  currentDbName: string;
};

const dolthubHost = "https://doltremoteapi.dolthub.com";

export default function RemoteUrl({
  type,
  remoteUrl,
  setRemoteUrl,
  currentDbName,
}: Props) {
  const [ownerName, setOwnerName] = useState("");
  const [dbName, setDbName] = useState(currentDbName);
  const [host, setHost] = useState("");
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
      {type === RemoteType.DoltLab && (
        <FormInput
          value={host}
          onChangeString={(s: string) => {
            setHost(s);
            setRemoteUrl(`${s}/${ownerName}/${dbName}`);
          }}
          label="Host"
          placeholder="Url of your host, i.e. https://doltlab.dolthub.com:50051"
          className={css.input}
        />
      )}
      <FormInput
        value={ownerName}
        onChangeString={(s: string) => {
          setOwnerName(s);
          setRemoteUrl(
            `${type === RemoteType.DoltHub ? dolthubHost : host}/${s}/${dbName}`,
          );
        }}
        label="Owner Name"
        placeholder="Owner of your database on DoltHub, i.e. dolthub"
        className={css.input}
      />
      <FormInput
        value={dbName}
        onChangeString={(s: string) => {
          setDbName(s);
          setRemoteUrl(
            `${type === RemoteType.DoltHub ? dolthubHost : host}/${ownerName}/${s}`,
          );
        }}
        label="Database Name"
        placeholder="Name of your database on DoltHub, i.e. example-db"
        className={css.input}
      />
    </div>
  );
}
