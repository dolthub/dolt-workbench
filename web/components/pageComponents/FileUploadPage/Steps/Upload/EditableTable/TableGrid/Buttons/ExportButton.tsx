import Button from "@components/Button";
import { Loader } from "@dolthub/react-components";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  onExport: () => Promise<unknown>;
};

export default function ExportButton({ onExport }: Props) {
  const [exporting, setExporting] = useState(false);
  return (
    <div className={css.exportButton}>
      <Loader loaded={!exporting} />
      <Button
        disabled={exporting}
        onClick={async () => {
          setExporting(true);
          await onExport();
          setExporting(false);
        }}
        data-cy="upload-table-button"
      >
        Upload table
      </Button>
    </div>
  );
}
