import Button from "@components/Button";
import Link from "@components/links/Link";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { TableParams } from "@lib/params";
import { table } from "@lib/urls";
import { AiOutlineCode } from "@react-icons/all-files/ai/AiOutlineCode";
import { AiOutlineDelete } from "@react-icons/all-files/ai/AiOutlineDelete";
import OptionSquare from "./OptionSquare";
import css from "./index.module.css";
import { getInsertQuery } from "./utils";

type Props = {
  params: TableParams;
};

export default function EditTableButtons(props: Props) {
  const { executeQuery, setEditorString, toggleSqlEditor } =
    useSqlEditorContext();

  const { columns } = useDataTableContext();
  // const tagRes = useTagListQuery({
  //   variables: props.params,
  // });
  // const refIsTag = !!tagRes.data?.tags.list.find(
  //   t => t.tagName === props.params.refName,
  // );

  const onWriteQuery = () => {
    setEditorString(getInsertQuery(props.params.tableName, columns));
    toggleSqlEditor(true);
  };

  const onDrop = async () => {
    await executeQuery({
      ...props.params,
      query: `DROP TABLE \`${props.params.tableName}\``,
    });
  };

  return (
    <div className={css.editTableContainer}>
      <h2>
        Edit table{" "}
        <span className={css.tableName}>{props.params.tableName}</span>
      </h2>
      {/* {refIsTag && (
        <ErrorMsg errString="A tag is currently selected. Please change to a branch from the left branch/tag dropdown to edit this database." />
      )} */}
      <div className={css.sections}>
        <OptionSquare
          icon={<AiOutlineCode />}
          // disabled={refIsTag}
          link={
            <Button.Link onClick={onWriteQuery} data-cy="sql-query-edit-button">
              SQL Query
            </Button.Link>
          }
        />
      </div>
      <Button.Link
        onClick={onDrop}
        className={css.drop}
        // disabled={refIsTag}
        red
      >
        <AiOutlineDelete /> Drop Table
      </Button.Link>
      <Link {...table(props.params)}>
        <Button.Underlined className={css.cancel}>Cancel</Button.Underlined>
      </Link>
    </div>
  );
}
