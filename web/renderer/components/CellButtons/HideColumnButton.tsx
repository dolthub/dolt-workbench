import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useDataTableStack from "@hooks/useDataTableStack";
import { removeFromProjection } from "@lib/dataTableParams";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideColumnButton({ col, columns }: Props) {
  const { tableShape } = useDataTableContext();
  const { stack, update } = useDataTableStack();

  if (!tableShape) return null;

  const onClick = () => {
    update({
      ...stack,
      projection: removeFromProjection(
        stack.projection,
        col.name,
        columns.map(c => c.name),
      ),
    });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide column
    </Button.Link>
  );
}
