import {
  Button,
  ButtonsWithError,
  FormInput,
  Loader,
} from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
import {
  DoltDatabaseDetails,
  useAddRemoteMutation,
  useDoltDatabaseDetailsQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { DatabaseParams } from "@lib/params";
import { refetchRemoteQueries } from "@lib/refetchQueries";
import { remotes } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import Link from "@components/links/Link";
import { getDatabaseType } from "@components/DatabaseTypeLabel";
import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

export default function AddRemoteForm(props: Props): JSX.Element {
  const router = useRouter();
  const { data: databaseDetails, loading: databaseDetailsLoading } =
    useDoltDatabaseDetailsQuery();
  const { dbLink, urlPlaceHolder } = getDbNameAndLink(
    databaseDetails?.doltDatabaseDetails,
  );
  const [remoteName, setRemoteName] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const {
    mutateFn: addRemote,
    err,
    loading,
  } = useMutation({
    hook: useAddRemoteMutation,
    refetchQueries: refetchRemoteQueries(props.params),
  });
  const { isMobile } = useReactiveWidth();

  const goToRemotesPage = () => {
    const { href, as } = remotes(props.params);
    router.push(href, as).catch(() => {});
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!remoteName || !remoteUrl) return;

    const { data } = await addRemote({
      variables: { ...props.params, remoteName, remoteUrl },
    });
    if (!data) return;
    const { href, as } = remotes(props.params);
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className={css.remoteForm}>
          <FormInput
            value={remoteName}
            onChangeString={setRemoteName}
            label="Add remote name"
            placeholder="i.e. origin"
            className={css.input}
          />
          <FormInput
            value={remoteUrl}
            onChangeString={setRemoteUrl}
            label="Add remote url"
            placeholder={urlPlaceHolder}
            className={css.input}
          />
          <ButtonsWithError
            onCancel={goToRemotesPage}
            left
            stackedButton={isMobile}
            error={err}
          >
            <Button type="submit" disabled={!remoteName || !remoteUrl}>
              Add remote
            </Button>
          </ButtonsWithError>
          <p className={css.text}>
            A remote is a {dbLink} database in another location, usually on a
            different, network accessible host. To learn more about configuring
            a remote for your database, see our{" "}
            <Link href="https://docs.dolthub.com/concepts/dolt/git/remotes">
              documentation
            </Link>
          </p>
        </div>
        <Loader loaded={!loading && !databaseDetailsLoading} />
      </form>
    </div>
  );
}

type ReturnType = {
  dbLink: JSX.Element;
  urlPlaceHolder: string;
};

function getDbNameAndLink(dbDetails?: DoltDatabaseDetails): ReturnType {
  const type = getDatabaseType(
    dbDetails?.type ?? undefined,
    !!dbDetails?.isDolt,
  );
  const universalUrl = "i.e. https://url-of-remote.com";
  if (type === "Dolt") {
    return {
      dbLink: <DoltLink />,
      urlPlaceHolder: "i.e. https://doltremoteapi.dolthub.com/owner/repo",
    };
  }
  if (type === "DoltgreSQL") {
    return { dbLink: <DoltgresLink />, urlPlaceHolder: universalUrl };
  }
  return { dbLink: <span>{type}</span>, urlPlaceHolder: universalUrl };
}
