import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { convertToSqlWithNewCols, getColumns } from "@lib/parseSqlQuery";
import css from "./index.module.css";

export default function ShowAllColumns() {
  const { executeQuery } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const { tableName } = params;

  if (!tableName) return null;

  const q = params.q ?? `SELECT * FROM \`${params.tableName}\``;
  const col = getColumns(q);

  if (!col || col === "*") return null;

  const onClick = async () => {
    const query = convertToSqlWithNewCols(q, "*", tableName);
    await executeQuery({ ...params, query });
  };

  return (
    <Button.Underlined className={css.colsButton} onClick={onClick}>
      Show all columns
    </Button.Underlined>
  );
}
