import ErrorMsg from "@components/ErrorMsg";
import TableSelector from "@components/TableSelector";
import { Loader } from "@dolthub/react-components";
import StepLayout from "../../StepLayout";
import UploadQueryInfo from "../../UploadQueryInfo";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import { UploadStage } from "../../enums";
import TableOption from "./TableOption";
import css from "./index.module.css";
import useTable from "./useTable";

export default function Table() {
  const { initialLoad, error } = useFileUploadContext();

  if (initialLoad) return <Loader loaded={false} />;
  if (error) return <ErrorMsg err={error} />;

  return <Inner />;
}

function Inner() {
  const {
    dbParams,
    updateLoad,
    error,
    state: { branchName },
    getUploadUrl,
  } = useFileUploadContext();
  const { onNext, disabled, state, setState } = useTable();

  return (
    <StepLayout
      title="Choose a table name"
      stage={UploadStage.Table}
      onNext={onNext}
      disabled={disabled}
      backUrl={getUploadUrl("branch")}
      onWrongStage={!branchName}
      dataCy="table"
    >
      <div>
        <Loader loaded={!updateLoad} />
        <div className={css.container}>
          <TableOption title="Update an existing table">
            <div>
              <TableSelector
                params={{ ...dbParams, refName: branchName }}
                selectedTable={state.existingTable}
                onChangeTable={t => setState({ existingTable: t ?? undefined })}
                light
              />
              <UploadQueryInfo />
            </div>
          </TableOption>
        </div>
        <ErrorMsg errString={state.err || state.valErr} err={error} />
      </div>
    </StepLayout>
  );
}
