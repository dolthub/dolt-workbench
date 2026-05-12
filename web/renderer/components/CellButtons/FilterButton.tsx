import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useDataTableStack from "@hooks/useDataTableStack";
import { appendWhere } from "@lib/dataTableParams";
import css from "./index.module.css";
import { convertTimestamp } from "./utils";

type Props = {
  col?: ColumnForDataTableFragment;
  value: string;
  dataCy: string;
};

export default function FilterButton({ col, value, dataCy }: Props) {
  const { params, tableShape } = useDataTableContext();
  const { stack, update } = useDataTableStack();
  const { tableName } = params;

  if (!tableName || !tableShape) return null;

  const onClick = () => {
    if (!col) return;
    // TODO: timestamp not working for postgres
    const val = col.type.toLowerCase().includes("timestamp")
      ? convertTimestamp(value)
      : value;
    update({
      ...stack,
      where: appendWhere(stack.where, { column: col.name, value: val }),
    });
  };

  return (
    <Button.Link onClick={onClick} className={css.button} data-cy={dataCy}>
      Filter By Cell
    </Button.Link>
  );
}
