import css from "./index.module.css";
import { ButtonWithPopup } from "@dolthub/react-components";
import { ChangeEvent, useState } from "react";
import { useConfigContext } from "@pageComponents/ConnectionsPage/NewConnection/context/config";


export default function MutualTLSForm() {
  const [tlsDropdownOpen, setTlsDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ ca: "", cert: "", key: "" });
  const { setState } = useConfigContext();

  const readPemFile = async (fileEvent: ChangeEvent<HTMLInputElement>, property: string, fileKey: keyof typeof selectedFiles) => {
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
    <ButtonWithPopup
      position="bottom center"
      keepTooltipInside
      contentStyle={{ width: "fit-content" }}
      closeOnEscape
      onOpen={() => setTlsDropdownOpen(true)}
      onClose={() => setTlsDropdownOpen(false)}
      triggerText="Mutual TLS Authentication"
      open={tlsDropdownOpen}
    >
      <div className={css.dropdownContent}>
        <p className={css.sectionDescription}>
          Required if your database server uses mTLS authentication
        </p>
        <FileInputOption
          fileLabel="CA"
          fileName={selectedFiles.ca}
          onFileChange={async fileEvent => await readPemFile(fileEvent, "certificateAuthority", "ca")}
        />
        <FileInputOption
          fileLabel="Client Certificate"
          fileName={selectedFiles.cert}
          onFileChange={async fileEvent => await readPemFile(fileEvent, "clientCert", "cert")}
        />
        <FileInputOption
          fileLabel="Client Key"
          fileName={selectedFiles.key}
          onFileChange={async fileEvent => await readPemFile(fileEvent, "clientKey", "key")}
        />

      </div>
    </ButtonWithPopup>
  )
}

type FileInputProps = {
  fileLabel: string;
  fileName: string;
  onFileChange: (fileEvent: ChangeEvent<HTMLInputElement>) => void;
}

function FileInputOption({ fileLabel, fileName, onFileChange }: FileInputProps) {
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
        <button type="button" className={css.fileInputButton}>Choose File</button>
      </div>
    </div>
  )
}
