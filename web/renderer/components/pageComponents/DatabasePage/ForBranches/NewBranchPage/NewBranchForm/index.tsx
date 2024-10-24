import BranchAndCommitSelector from "@components/FormSelectForRefs/BranchAndCommitSelector";
import {
  Button,
  ButtonsWithError,
  FormInput,
  Loader,
} from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { useCreateBranchMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { OptionalRefParams } from "@lib/params";
import { refetchBranchQueries } from "@lib/refetchQueries";
import { branches, ref } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
};

export default function NewBranchForm(props: Props): JSX.Element {
  const router = useRouter();
  const [newBranchName, setNewBranchName] = useState("");
  const [fromRefName, setFromRefName] = useState<Maybe<string>>(null);
  const {
    mutateFn: createBranch,
    err,
    loading,
  } = useMutation({
    hook: useCreateBranchMutation,
    refetchQueries: refetchBranchQueries(props.params),
  });
  const { isMobile } = useReactiveWidth();

  const goToBranchesPage = () => {
    const { href, as } = branches(props.params);
    router.push(href, as).catch(() => {});
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!newBranchName || !fromRefName) return;

    const { data } = await createBranch({
      variables: { ...props.params, newBranchName, fromRefName },
    });
    if (!data) return;
    const { href, as } = ref({
      ...props.params,
      refName: data.createBranch,
    });
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className={css.container}>
          <BranchAndCommitSelector
            {...props}
            selectedValue={fromRefName}
            onChangeValue={setFromRefName}
          />
          <FormInput
            value={newBranchName}
            onChangeString={setNewBranchName}
            label="New branch name"
            placeholder="i.e. feature-branch"
            className={css.input}
          />
          <ButtonsWithError
            onCancel={goToBranchesPage}
            left
            stackedButton={isMobile}
            error={err}
          >
            <Button type="submit" disabled={!newBranchName || !fromRefName}>
              Create branch
            </Button>
          </ButtonsWithError>
        </div>
        <Loader loaded={!loading} />
      </form>
    </div>
  );
}
