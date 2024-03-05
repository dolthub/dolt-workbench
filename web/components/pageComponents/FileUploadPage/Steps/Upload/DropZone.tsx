import ErrorMsg from "@components/ErrorMsg";
import { Button } from "@dolthub/react-components";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";
import cx from "classnames";
import { useRef } from "react";
import FileInfo from "../../FileInfo";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import useUploadContext from "./contexts/upload";
import css from "./index.module.css";
import { useDropZone, validTypes } from "./useDropZone";

export default function DropZone() {
  const dz = useDropZone();
  const { state } = useFileUploadContext();
  const { setState } = useUploadContext();
  const fileInputRef = useRef<any>(null);
  const fileTypes = validTypes.map(getTypesString);

  const onBrowse = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  return (
    <div className={css.container}>
      <div
        className={cx(css.dropContainer, {
          [css.hover]: dz.hover,
          [css.dropped]: state.selectedFile,
        })}
        onDragOver={dz.dragOver}
        onDragLeave={dz.dragLeave}
        onDrop={dz.onDropFile}
        data-cy="drop-container"
      >
        <div className={css.message}>
          {state.selectedFile ? (
            <div>
              <span className={css.success} data-cy="upload-successful">
                <FiCheck />
                Upload successful
              </span>
              <FileInfo
                onRemove={() => setState({ error: undefined })}
                upload
              />
            </div>
          ) : (
            <div className={css.uploadText}>
              <FiUpload className={css.uploadIcon} />
              <div>Drag a file here</div>
              <div>or</div>
              <div className={css.uploadBottom}>
                <Button.Link onClick={onBrowse} className={css.browseButton}>
                  Browse files
                </Button.Link>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={dz.onChooseFile}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <ErrorMsg errString={dz.err} />
      {!state.selectedFile && (
        <div className={css.fileTypes}>File types: {fileTypes}</div>
      )}
    </div>
  );
}

function getTypesString(t: string, i: number): string {
  const val = t === "json" ? `.${t}*` : `.${t}`;
  if (i === validTypes.length - 1) {
    return val;
  }
  return `${val}, `;
}
