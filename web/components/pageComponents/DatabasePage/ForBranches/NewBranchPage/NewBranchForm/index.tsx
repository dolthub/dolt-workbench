import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import CustomFormSelect from "@components/CustomFormSelect";
import ErrorMsg from "@components/ErrorMsg";
import FormInput from "@components/FormInput";
import { Loader } from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
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
  const [fromRefName, setFromRefName] = useState("");
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
          <CustomFormSelect.ForBranchesAndCommits
            {...props}
            selectedValue={fromRefName}
            onChangeValue={setFromRefName}
          />
          <FormInput
            value={newBranchName}
            onChangeString={setNewBranchName}
            label="New branch name"
            placeholder=""
            className={css.input}
          />
          <ButtonsWithError
            onCancel={goToBranchesPage}
            left
            stackedButton={isMobile}
          >
            <Button type="submit" disabled={!newBranchName || !fromRefName}>
              Create branch
            </Button>
          </ButtonsWithError>
        </div>
        <Loader loaded={!loading} />
        <ErrorMsg className={css.error} err={err} />
      </form>
    </div>
  );
}
