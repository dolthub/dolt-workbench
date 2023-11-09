import Button from "@components/Button";
import { useState } from "react";
import ReactLoader from "react-loader";
import css from "./index.module.css";

type Props = {
  onExport: () => Promise<unknown>;
};

export default function ExportButton({ onExport }: Props) {
  const [exporting, setExporting] = useState(false);
  return (
    <div className={css.exportButton}>
      <ReactLoader loaded={!exporting} />
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
