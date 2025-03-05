import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { useDataTableContext } from "@contexts/dataTable";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { Tooltip } from "@dolthub/react-components";
import { useSqlEditorContext } from "@contexts/sqleditor";
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
    <tr className={css.row}>
      <td>
        <div className={css.buttons}>
          <AiOutlineCheck
            className={css.save}
            onClick={onSave}
            data-tooltip-content="Submit changes"
            data-tooltip-id="submit-changes"
          />
          <IoMdClose className={css.deleteRow} onClick={onDelete} />
          <Tooltip id="submit-changes" className={css.tooltip} place="right" />
        </div>
      </td>
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <PendingCell {...props} cell={c} cidx={cidx} />
      ))}
    </tr>
  );
}
