import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import css from "./index.module.css";
import { useGetFilterByCellQuery } from "./queryHelpers";

type Props = {
  col?: ColumnForDataTableFragment;
  value: string;
};

export default function FilterButton({ col, value }: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const { tableName } = params;

  if (!tableName) return null;

  const onClick = async () => {
    if (!col) {
      return;
    }
    const query = useGetFilterByCellQuery(col, value, { ...params, tableName });
    await executeQuery({ ...params, query });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        Filter By Cell
      </Button.Link>
    </div>
  );
}
