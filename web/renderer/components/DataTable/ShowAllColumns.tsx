import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import useDataTableStack from "@hooks/useDataTableStack";
import css from "./index.module.css";

export default function ShowAllColumns() {
  const { params, tableShape } = useDataTableContext();
  const { stack, update } = useDataTableStack();

  if (!params.tableName || !tableShape) return null;
  if (!stack.projection || stack.projection.length === 0) return null;

  const onClick = () => {
    update({ ...stack, projection: undefined });
  };

  return (
    <Button.Link underlined className={css.colsButton} onClick={onClick}>
      Show all columns
    </Button.Link>
  );
}
