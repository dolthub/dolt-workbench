import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import css from "./index.module.css";
import { toPKColsMapQueryCols } from "./queryHelpers";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideRowButton(props: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const { hideRowQuery } = useSqlBuilder();

  if (!tableName) return null;

  const onClick = async () => {
    const query = hideRowQuery(
      tableName,
      toPKColsMapQueryCols(props.row, props.columns, columns),
    );
    await executeQuery({ ...params, query });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide row
    </Button.Link>
  );
}
