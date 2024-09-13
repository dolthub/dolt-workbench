import { ErrorMsg, Loader } from "@dolthub/react-components";
import StepLayout from "../../StepLayout";
import Summary from "../../Summary";
import UploadQueryInfo from "../../UploadQueryInfo";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import { UploadStage } from "../../enums";
import DropZone from "./DropZone";
import EditableTable from "./EditableTable";
import OpenSpreadsheetZone from "./OpenSpreadsheetZone";
import useUploadContext, { UploadProvider } from "./contexts/upload";
import css from "./index.module.css";

export default function Upload() {
  const { initialLoad, error } = useFileUploadContext();

  if (initialLoad) return <Loader loaded={false} />;
  if (error) return <ErrorMsg err={error} />;

  return (
    <UploadProvider>
      <Inner />
    </UploadProvider>
  );
}

function Inner() {
  const { state, updateLoad, error, getUploadUrl } = useFileUploadContext();
  const { onUpload, state: uState } = useUploadContext();

  return (
    <StepLayout
      title="Upload file"
      stage={UploadStage.Upload}
      disabled={
        !!uState.error || !state.selectedFile || updateLoad || uState.loading
      }
      onNext={async () => {
        if (!state.selectedFile) return;
        await onUpload(state.selectedFile, state.fileType);
      }}
      backUrl={getUploadUrl("table")}
      onWrongStage={!state.tableName}
      dataCy="upload"
    >
      <div>
        <Loader loaded={!uState.loading && !updateLoad} />
        <Summary />
        <div className={css.uploadContainer}>
          <DropZone />
          <div className={css.or}>or</div>
          <OpenSpreadsheetZone />
        </div>
        <EditableTable />
        <UploadQueryInfo />
        <ErrorMsg err={uState.error ?? error} />
      </div>
    </StepLayout>
  );
}
