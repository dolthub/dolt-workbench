import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { useDataTableContext } from "@contexts/dataTable";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { Button } from "@dolthub/react-components";
import { useSqlEditorContext } from "@contexts/sqleditor";
import cx from "classnames";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
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
      <td className={css.buttons}>
        <IoMdClose className={css.deleteRow} onClick={onDelete} />
      </td>
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <PendingCell {...props} cell={c} cidx={cidx} />
      ))}
      <td className={css.buttons}>
        <Button onClick={onSave} size="small" className={css.submitButton}>
          submit
        </Button>
        <IoMdClose className={css.deleteRow} onClick={onDelete} />
      </td>
    </tr>
  );
}
