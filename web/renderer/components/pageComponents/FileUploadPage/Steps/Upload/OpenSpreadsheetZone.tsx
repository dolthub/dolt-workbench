import { Button } from "@dolthub/react-components";
import { GrTable } from "@react-icons/all-files/gr/GrTable";
import cx from "classnames";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import useUploadContext from "./contexts/upload";
import css from "./index.module.css";

export default function OpenSpreadsheetZone() {
  const { setState } = useUploadContext();
  const { state } = useFileUploadContext();

  const onClick = () => {
    setState({ spreadsheetOverlayOpen: true });
  };

  return (
    <div>
      <div
        className={cx(css.editableTable, {
          [css.faded]: !!state.selectedFile,
        })}
      >
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
      </div>
    </div>
  );
}
