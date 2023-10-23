import Link from "@components/links/Link";
import { ImportOperation } from "@gen/graphql-types";
import { useFileUploadContext } from "./contexts/fileUploadLocalForage";
import { FileUploadState } from "./contexts/fileUploadLocalForage/state";

export default function Summary() {
  const { state, getUploadUrl } = useFileUploadContext();
  return (
    <p>
      {getOpVerb(state.importOp)} table{" "}
      <Link {...getUploadUrl("table")}>{state.tableName}</Link>
      {getUploadMethod(state)}
    </p>
  );
}

// Add -ing to import op verb
export function getOpVerb(op: ImportOperation): string {
  const endsWithE = op.endsWith("e");
  return endsWithE ? `${op.slice(0, -1)}ing` : `${op}ing`;
}

export function getUploadMethod(state: FileUploadState): string {
  if (state.spreadsheetRows) {
    return " using new spreadsheet";
  }
  if (state.selectedFile) {
    return " using uploaded file";
  }
  return "";
}
