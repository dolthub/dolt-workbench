import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { useDataTableContext } from "@contexts/dataTable";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { Button } from "@dolthub/react-components";
import { useSqlEditorContext } from "@contexts/sqleditor";
import cx from "classnames";
import PendingCell from "./PendingCell";
import css from "./index.module.css";

type Props = {
  row: RowForDataTableFragment;
  isMobile?: boolean;
  columns: ColumnForDataTableFragment[];
};

export default function PendingRow(props: Props) {
  const { insertIntoTable } = useSqlBuilder();
  const { setPendingRow, params, columns } = useDataTableContext();
  const { executeQuery } = useSqlEditorContext();

  const { tableName } = params;
  if (!tableName) return null;

  const onDelete = () => {
    setPendingRow(undefined);
  };

  const onSave = async () => {
    const query = insertIntoTable(
      tableName,
      columns?.map(c => c.name) || [],
      columns?.map((c, idx) => {
        return {
          type: c.type,
          value: `"${props.row.columnValues[idx]?.displayValue}"`,
        };
      }) || [],
    );
    await executeQuery({ ...params, query });
    setPendingRow(undefined);
  };

  return (
    <tr className={cx(css.row, css.pendingRow)}>
      <td />
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <PendingCell {...props} cell={c} cidx={cidx} />
      ))}
      <td className={css.buttons}>
        <Button.Group className={css.buttonGroup}>
          <Button.Link onClick={onSave} className={css.save}>
            submit
          </Button.Link>
          <Button.Link onClick={onDelete} red>
            cancel
          </Button.Link>
        </Button.Group>
      </td>
    </tr>
  );
}
