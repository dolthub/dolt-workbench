import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useDataTableStack from "@hooks/useDataTableStack";
import { appendExcludePk } from "@lib/dataTableParams";
import css from "./index.module.css";
import { toPKWhereClauses } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideRowButton(props: Props) {
  const { params, columns, tableShape } = useDataTableContext();
  const { stack, update } = useDataTableStack();
  const { tableName } = params;

  if (!tableName || !tableShape) return null;

  const onClick = () => {
    const values = toPKWhereClauses(props.row, props.columns, columns);
    update({
      ...stack,
      excludePks: appendExcludePk(stack.excludePks, { values }),
    });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide row
    </Button.Link>
  );
}
