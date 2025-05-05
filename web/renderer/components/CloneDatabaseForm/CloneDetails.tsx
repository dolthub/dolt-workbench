import { Checkbox } from "@dolthub/react-components";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  DatabasesByConnectionDocument,
  useDoltCloneMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { database } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import css from "./index.module.css";
import CloneForm from "./CloneForm";

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
  const { mutateFn: doltClone, ...res } = useMutation({
    hook: useDoltCloneMutation,
    refetchQueries: [{ query: DatabasesByConnectionDocument }],
  });
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(res.loading);

  useEffect(() => {
    if (!res.err) return;
    setErr(res.err);
  }, [res.err]);

  if (currentConnection.type === DatabaseType.Postgres) {
    return null;
  }

  const onCloneDoltHubDatabase = async (
    e: SyntheticEvent,
    owner: string,
    remoteDbName: string,
    newDbName: string,
  ) => {
    e.preventDefault();
    let interval;
    let progressPercent = 0;
    setProgress(0);
    setErr(undefined);
    setLoading(true);

    try {
      interval = setInterval(() => {
        progressPercent += 0.05;
        setProgress(Math.min(progressPercent, 95));
      }, 10);
      const { success } = await doltClone({
        variables: {
          ownerName: owner.trim(),
          remoteDbName: remoteDbName.trim(),
          databaseName: newDbName.trim(),
        },
      });
      if (!success) {
        return;
      }
      // Complete progress to 100%
      setProgress(100);

      const { href, as } = database({ databaseName: newDbName.trim() });
      router.push(href, as).catch(console.error);
    } catch (_) {
      // handled by res.error
    } finally {
      if (interval) {
        clearInterval(interval);
      }
      setLoading(false);
      setProgress(progress === 100 ? 0 : progress);
    }
  };

  return (
    <div className={css.form}>
      <Checkbox
        checked={cloneDolt}
        onChange={() => {
          setCloneDolt(!cloneDolt);
        }}
        name="clone-dolt-server"
        label="Clone a remote Dolt database from DoltHub"
        className={css.checkbox}
      />
      {cloneDolt && (
        <CloneForm
          onCloneDoltHubDatabase={onCloneDoltHubDatabase}
          progress={progress}
          loading={loading}
          error={err}
          setErr={setErr}
        />
      )}
    </div>
  );
}
