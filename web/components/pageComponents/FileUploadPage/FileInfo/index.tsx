import Button from "@components/Button";
import { FiFile } from "@react-icons/all-files/fi/FiFile";
import cx from "classnames";
import { ReactNode } from "react";
import { useFileUploadContext } from "../contexts/fileUploadLocalForage";
import css from "./index.module.css";

type Props = {
  onRemove?: () => void;
  editButton?: ReactNode;
  upload?: boolean;
};

export default function FileInfo(props: Props) {
  const { setState, state } = useFileUploadContext();

  const removeFile = () => {
    setState({
      selectedFile: undefined,
      colNames: "",
    });
    if (props.onRemove) props.onRemove();
  };

  if (!state.selectedFile) return null;

  return (
    <div>
      <div
        className={cx(css.fileInfoContainer, { [css.between]: !props.upload })}
      >
        <span className={css.fileInfo}>
          <FiFile className={css.fileIcon} />
          <span data-cy="file-name">{state.selectedFile.name}</span>
          <span className={css.fileSize}>
            {fileSize(state.selectedFile.size)}
          </span>
        </span>
        <div className={cx({ [css.buttons]: props.upload })}>
          {props.editButton}
          <Button.Link onClick={removeFile} red>
            remove
          </Button.Link>
        </div>
      </div>
    </div>
  );
}

function fileSize(size: number): string {
  if (size === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return `${parseFloat((size / k ** i).toFixed(2))} ${sizes[i]}`;
}
