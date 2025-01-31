import DatabaseUploadStageLink from "@components/links/DatabaseUploadStageLink";
import Link from "@components/links/Link";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { useTagListQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useSqlBuilder from "@hooks/useSqlBuilder";
import {
  TableOptionalSchemaParams,
  UploadParamsWithOptions,
} from "@lib/params";
import { table } from "@lib/urls";
import { AiOutlineCode } from "@react-icons/all-files/ai/AiOutlineCode";
import { AiOutlineDelete } from "@react-icons/all-files/ai/AiOutlineDelete";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";
import { ImTable2 } from "@react-icons/all-files/im/ImTable2";
import OptionSquare from "./OptionSquare";
import css from "./index.module.css";
import { mapColTypeToFakeValue } from "./utils";

type Props = {
  params: TableOptionalSchemaParams;
};

type InnerProps = Props & {
  refIsTag?: boolean;
};

function Inner(props: InnerProps) {
  const { executeQuery, setEditorString, toggleSqlEditor } =
    useSqlEditorContext();
  const { dropTable, insertIntoTable } = useSqlBuilder(
    props.params.connectionName,
  );
  const { columns } = useDataTableContext();

  const uploadParams: UploadParamsWithOptions = {
    ...props.params,
    branchName: props.params.refName,
    uploadId: String(Date.now()),
  };

  const onWriteQuery = () => {
    const values = columns?.map(mapColTypeToFakeValue) ?? [];
    const colNames = columns?.map(c => c.name) ?? [];
    setEditorString(insertIntoTable(props.params.tableName, colNames, values));
    toggleSqlEditor(true);
  };

  const onDrop = async () => {
    await executeQuery({
      ...props.params,
      query: dropTable(props.params.tableName),
    });
  };

  return (
    <div className={css.editTableContainer}>
      <h2>
        Edit table{" "}
        <span className={css.tableName}>{props.params.tableName}</span>
      </h2>
      {props.refIsTag && (
        <ErrorMsg errString="A tag is currently selected. Please change to a branch from the left branch/tag dropdown to edit this database." />
      )}
      <div className={css.sections}>
        <OptionSquare
          icon={<AiOutlineCode />}
          disabled={props.refIsTag}
          link={
            <Button.Link
              onClick={onWriteQuery}
              data-cy="sql-query-edit-button"
              disabled={props.refIsTag}
            >
              SQL Query
            </Button.Link>
          }
        />
        <OptionSquare
          icon={<ImTable2 />}
          disabled={props.refIsTag}
          link={
            <DatabaseUploadStageLink
              params={{ ...uploadParams, spreadsheet: true }}
              stage="upload"
            >
              Spreadsheet Editor
            </DatabaseUploadStageLink>
          }
        />
        <OptionSquare
          icon={<FiUpload />}
          disabled={props.refIsTag}
          link={
            <DatabaseUploadStageLink params={uploadParams} stage="upload">
              File Upload
            </DatabaseUploadStageLink>
          }
        />
      </div>
      <Button.Link
        onClick={onDrop}
        className={css.drop}
        disabled={props.refIsTag}
        red
      >
        <AiOutlineDelete /> Drop Table
      </Button.Link>
      <Link {...table(props.params)}>
        <Button.Link underlined className={css.cancel}>
          Cancel
        </Button.Link>
      </Link>
    </div>
  );
}

function ForDolt(props: Props) {
  const tagRes = useTagListQuery({
    variables: props.params,
  });
  const refIsTag = !!tagRes.data?.tags.list.find(
    t => t.tagName === props.params.refName,
  );
  return <Inner {...props} refIsTag={refIsTag} />;
}

export default function EditTableButtons(props: Props) {
  const res = useDatabaseDetails(props.params.connectionName);

  if (!res.isDolt) return <Inner {...props} />;
  return <ForDolt {...props} />;
}
