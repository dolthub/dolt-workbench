import { useFileUploadContext } from "@components/pageComponents/FileUploadPage/contexts/fileUploadLocalForage";
import QueryHandler from "@components/util/QueryHandler";
import { useDataTableQuery } from "@gen/graphql-types";
import { TableParams } from "@lib/params";
import useUploadContext from "../contexts/upload";
import TableEditorOverlay from "./TableEditorOverlay";

type InnerProps = {
  params: TableParams;
};

function Inner(props: InnerProps) {
  const tableRes = useDataTableQuery({
    variables: props.params,
  });

  return (
    <QueryHandler
      result={tableRes}
      render={td => <TableEditorOverlay columns={td.table.columns} />}
    />
  );
}

function WithQuery() {
  const { state, dbParams } = useFileUploadContext();
  const params = {
    ...dbParams,
    refName: state.branchName,
    tableName: state.tableName,
  };
  return <Inner params={params} />;
}

// Must be child of UploadProvider and FileUploadLocalForageProvider
// or UploadProvider and FileUploadLocalForageProvider
export default function EditableTable() {
  const {
    state: { spreadsheetOverlayOpen },
  } = useUploadContext();

  if (!spreadsheetOverlayOpen) return null;

  return <WithQuery />;
}
