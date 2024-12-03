import {
  Button,
  ButtonsWithError,
  FormInput,
  Loader,
} from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
import { useAddRemoteMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { DatabaseParams } from "@lib/params";
import { refetchBranchQueries } from "@lib/refetchQueries";
import { remotes } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

export default function AddRemoteForm(props: Props): JSX.Element {
  const router = useRouter();
  const [remoteName, setRemoteName] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const {
    mutateFn: addRemote,
    err,
    loading,
  } = useMutation({
    hook: useAddRemoteMutation,
    refetchQueries: refetchBranchQueries(props.params),
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
        </div>
        <Loader loaded={!loading} />
      </form>
    </div>
  );
}
