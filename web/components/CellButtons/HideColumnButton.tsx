import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { removeColumnFromQuery } from "@lib/parseSqlQuery";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideColumnButton({ col, columns }: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const q = params.q ?? `SELECT * FROM \`${params.tableName}\``;

  const onClick = async () => {
    const query = removeColumnFromQuery(q, col.name, columns);
    await executeQuery({ ...params, query });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        Hide column
      </Button.Link>
    </div>
  );
}
