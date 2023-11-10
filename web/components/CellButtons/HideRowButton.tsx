import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { mapQueryColsToAllCols } from "@lib/dataTable";
import css from "./index.module.css";
import { getHideRowQuery } from "./queryHelpers";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideRowButton(props: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;

  if (!tableName) return null;

  const onClick = async () => {
    const query = getHideRowQuery(
      tableName,
      props.row,
      mapQueryColsToAllCols(props.columns, columns),
    );
    await executeQuery({ ...params, query });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        Hide row
      </Button.Link>
    </div>
  );
}
