import ErrorMsg from "@components/ErrorMsg";
import useGetBranchOptionsForSelect from "@components/FormSelectForRefs/useGetBranchOptionsForSelect";
import DatabaseLink from "@components/links/DatabaseLink";
import { FormSelect, Loader } from "@dolthub/react-components";
import StepLayout from "../../StepLayout";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import { UploadStage } from "../../enums";
import css from "./index.module.css";

export default function Branch() {
  const { initialLoad, error } = useFileUploadContext();
  if (initialLoad) return <Loader loaded={false} />;
  if (error) return <ErrorMsg err={error} />;
  return <Inner />;
}

function Inner() {
  const { state, error, updateLoad, setItem, dbParams, getUploadUrl } =
    useFileUploadContext();
  const { branchOptions } = useGetBranchOptionsForSelect(dbParams);

  return (
    <StepLayout
      title="Choose a base branch"
      stage={UploadStage.Branch}
      disabled={updateLoad}
      nextUrl={getUploadUrl("table")}
      dataCy="branch"
    >
      <div>
        <Loader loaded={!updateLoad} />
        <div data-cy="upload-choose-branch">
          <p>
            Choose the branch on{" "}
            <DatabaseLink params={dbParams}>
              {dbParams.databaseName}
            </DatabaseLink>{" "}
            to base your changes on.
          </p>
          <FormSelect
            placeholder="select a branch..."
            outerClassName={css.outerSelector}
            className={css.selector}
            options={branchOptions}
            val={state.branchName}
            onChangeValue={b => setItem("branchName", b)}
            label="Branch"
            selectedOptionFirst
            horizontal
            mono
          />
        </div>
        <ErrorMsg err={error} />
      </div>
    </StepLayout>
  );
}
