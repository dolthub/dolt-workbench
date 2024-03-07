import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import { toPKColsMapQueryCols } from "./queryHelpers";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  refName?: string;
};

export default function DeleteRowButton(props: Props): JSX.Element | null {
  const { executeQuery, setEditorString } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const { deleteFromTable } = useSqlBuilder();

  if (!tableName || isUneditableDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const query = deleteFromTable(
      tableName,
      toPKColsMapQueryCols(props.row, props.columns, columns),
    );
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: props.refName ?? params.refName,
      query,
    });
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <Button.Link onClick={onClick} className={css.button}>
        Delete row
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}
