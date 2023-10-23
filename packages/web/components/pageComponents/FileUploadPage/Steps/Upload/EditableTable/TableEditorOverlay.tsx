import Button from "@components/Button";
import ErrorMsg from "@components/ErrorMsg";
import LoadDataInfo from "@components/pageComponents/FileUploadPage/LoadDataInfo";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { ErrorType } from "@lib/errors/types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { useFileUploadContext } from "../../../contexts/fileUploadLocalForage";
import { FileUploadState } from "../../../contexts/fileUploadLocalForage/state";
import useUploadContext from "../contexts/upload";
import TableGrid from "./TableGrid";
import css from "./index.module.css";

type Props = {
  columns: ColumnForDataTableFragment[];
};

type InnerProps = Props & {
  state: FileUploadState;
  onClose: () => void;
  error: ErrorType;
};

function Inner(props: InnerProps) {
  return (
    <div className={css.overlay}>
      <div className={css.container}>
        <div className={css.inner}>
          <Button.Link className={css.closeTop} onClick={props.onClose}>
            <IoMdClose />
          </Button.Link>
          <h1 data-cy="spreadsheet-editor-title">Spreadsheet Editor</h1>
          {props.state.tableName && <LoadDataInfo forSpreadsheet />}
          <div>
            <div>
              <ErrorMsg err={props.error} />
              <TableGrid {...props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TableEditorOverlay(props: Props) {
  const { state } = useFileUploadContext();
  const {
    state: { error },
    setState,
  } = useUploadContext();

  const onClose = () => {
    setState({ spreadsheetOverlayOpen: false, error: undefined });
  };

  return <Inner {...props} state={state} error={error} onClose={onClose} />;
}
