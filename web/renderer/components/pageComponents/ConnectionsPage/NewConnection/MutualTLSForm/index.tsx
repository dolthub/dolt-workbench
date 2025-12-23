import css from "./index.module.css";
import { Button } from "@dolthub/react-components";
import { ChangeEvent, useState } from "react";
import { useConfigContext } from "@pageComponents/ConnectionsPage/NewConnection/context/config";

export default function MutualTLSForm() {
  const [selectedFiles, setSelectedFiles] = useState({
    ca: "",
    cert: "",
    key: "",
  });
  const { setState } = useConfigContext();

  const readPemFile = async (
    fileEvent: ChangeEvent<HTMLInputElement>,
    property: string,
    fileKey: keyof typeof selectedFiles,
  ) => {
    const file = fileEvent.target.files?.[0];
    if (!file) return;

    const pem = await file.text();
    setSelectedFiles(prev => {
      return { ...prev, [fileKey]: file.name };
    });
    setState({
      [property]: pem,
    });
  };

  return (
    <div className={css.dropdownContent}>
      <FileInputOption
        fileLabel="CA"
        fileName={selectedFiles.ca}
        onFileChange={async fileEvent =>
          await readPemFile(fileEvent, "certificateAuthority", "ca")
        }
      />
      <FileInputOption
        fileLabel="Client Certificate"
        fileName={selectedFiles.cert}
        onFileChange={async fileEvent =>
          await readPemFile(fileEvent, "clientCert", "cert")
        }
      />
      <FileInputOption
        fileLabel="Client Key"
        fileName={selectedFiles.key}
        onFileChange={async fileEvent =>
          await readPemFile(fileEvent, "clientKey", "key")
        }
      />
    </div>
  );
}

type FileInputProps = {
  fileLabel: string;
  fileName: string;
  onFileChange: (fileEvent: ChangeEvent<HTMLInputElement>) => void;
};

function FileInputOption({
  fileLabel,
  fileName,
  onFileChange,
}: FileInputProps) {
  return (
    <div className={css.fileInputWrapper}>
      <label className={css.fileInputLabel}>{fileLabel}</label>
      <div className={css.customFileInput}>
        <input
          type="file"
          onChange={onFileChange}
          className={css.hiddenFileInput}
          data-cy="connection-file-input"
        />
        <div className={css.fileInputDisplay}>
          {fileName || "No file chosen"}
        </div>
        <Button className={css.fileInputButton}>Choose File</Button>
      </div>
    </div>
  );
}
