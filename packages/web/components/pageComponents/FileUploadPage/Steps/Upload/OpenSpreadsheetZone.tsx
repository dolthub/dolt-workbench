import Button from "@components/Button";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { GrTable } from "@react-icons/all-files/gr/GrTable";
import cx from "classnames";
import FileInfo from "../../FileInfo";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import useUploadContext from "./contexts/upload";
import css from "./index.module.css";

export default function OpenSpreadsheetZone() {
  const { setState } = useUploadContext();
  const { state, setItem } = useFileUploadContext();

  const onRemove = () => {
    setState({ error: undefined });
    setItem("selectedFile", undefined);
  };

  const onClick = () => {
    setState({ spreadsheetOverlayOpen: true });
  };

  const onEdit = () => {
    setState({
      spreadsheetOverlayOpen: true,
      error: undefined,
    });
  };

  return (
    <div>
      <div
        className={cx(css.editableTable, {
          [css.dropped]: state.spreadsheetRows,
          [css.faded]: state.selectedFile && !state.spreadsheetRows,
        })}
      >
        {state.spreadsheetRows ? (
          <div>
            <span
              className={css.success}
              data-cy="spreadsheet-upload-successful"
            >
              <FiCheck />
              Upload successful
            </span>
            <FileInfo
              onRemove={onRemove}
              editButton={
                <Button.Link onClick={onEdit} className={css.editBtn}>
                  edit
                </Button.Link>
              }
              upload
            />
          </div>
        ) : (
          <div>
            <GrTable className={css.tableIcon} />
            <h4>Create spreadsheet</h4>
            <div>
              <Button
                onClick={onClick}
                className={css.openButton}
                disabled={!!state.selectedFile}
                data-cy="spread-sheet-button"
              >
                Open editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
