import CustomFormSelect from "@components/CustomFormSelect";
import ErrorMsg from "@components/ErrorMsg";
import DatabaseLink from "@components/links/DatabaseLink";
import { Loader } from "@dolthub/react-components";
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
          <div className={css.selector}>
            <CustomFormSelect.ForBranches
              params={dbParams}
              selectedValue={state.branchName}
              onChangeValue={b => setItem("branchName", b)}
              showLabel
              mono
            />
          </div>
        </div>
        <ErrorMsg err={error} />
      </div>
    </StepLayout>
  );
}
