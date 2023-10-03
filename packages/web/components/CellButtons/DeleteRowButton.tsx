import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { mapQueryColsToAllCols } from "@lib/dataTable";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import { getDeleteRowQuery } from "./queryHelpers";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  refName?: string;
};

export default function DeleteRowButton(props: Props): JSX.Element | null {
  const { executeQuery, setEditorString } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;

  if (!tableName || isUneditableDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const query = getDeleteRowQuery(
      tableName,
      props.row,
      mapQueryColsToAllCols(props.columns, columns),
    );
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: props.refName ?? params.refName,
      query,
    });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        Delete row
      </Button.Link>
    </div>
  );
}
