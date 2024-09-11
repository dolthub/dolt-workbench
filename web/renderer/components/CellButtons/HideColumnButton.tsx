import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideColumnButton({ col, columns }: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { removeColumnFromQuery, selectFromTable } = useSqlBuilder();
  const { params } = useDataTableContext();
  const q = params.q ?? selectFromTable(params.tableName ?? "");

  const onClick = async () => {
    const query = removeColumnFromQuery(q, col.name, columns);
    await executeQuery({ ...params, query });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide column
    </Button.Link>
  );
}
